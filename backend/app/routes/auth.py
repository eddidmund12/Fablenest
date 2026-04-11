import os
from flask import Blueprint, make_response, jsonify, request, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user, login_user, logout_user
from app.models import User,Post, Comment, Notification, UserSession
from app.utils import (send_verification_email, generate_session_token, get_device_info, send_reset_email, data_validation, get_client_ip, get_location_from_ip, create_notifications, verify_reset_token, generate_otp, send_email, render_template, validate_otp, clear_user_otp)
from flask import current_app
from datetime import datetime, timedelta

from app.extensions import db, socketio, limiter
import re



auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    firstname = data.get("firstname")
    middlename = data.get("middlename")
    lastname = data.get("lastname")
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    confirmpassword = data.get("confirmpassword", "").strip()
    otp_input = data.get("otp")
    if not otp_input:
        return jsonify({"error": "OTP required. Send OTP to email first."}), 400
    errors_resp = data_validation(firstname, middlename, lastname, email, password, confirmpassword)
    errors = errors_resp.get_json()
    if errors and len(errors.get('errors', [])) > 0:
        return errors_resp, 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No pending registration. Send OTP first."}), 400
    if user.is_verified:
        return jsonify({"error": "Email already registered. Please login."}), 400
    is_valid, msg = validate_otp(user, otp_input)
    if not is_valid:
        return jsonify({"error": msg}), 400
    user.firstname = firstname
    user.middlename = middlename
    user.lastname = lastname
    user.password_hash = generate_password_hash(password)
    user.is_verified = True
    clear_user_otp(user)
    db.session.commit()
    

    token=generate_session_token()
    device_info=get_device_info(request)
    ip_address = get_client_ip(request)
    user_session =UserSession(user_id=user.id, 
                            session_token=token, 
                            email = user.email,
                            device_name=device_info["device_name"],
                            device_type=device_info["device_type"],
                            browser=device_info["browser"],
                            os=device_info["os"],
                            ip_address=ip_address,
                            location="Unknown",
                            last_activity=datetime.utcnow(),
                            expires_at=datetime.utcnow() + timedelta(days=7))
    db.session.add(user_session)
    db.session.commit()
 

    login_user(user)
    response=make_response(jsonify({"message": "Signup successful", "user": user.id, "email": user.email}))

    response.set_cookie("session_token",
                        token,
                        httponly=True,
                        secure=True,
                        samesite="Lax",
                        max_age=7*24*60*60)
    current_app.logger.info(f"Signup successful")
    return response
    


        
@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email format"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user:
        if user.is_verified:
            return jsonify({"error": "Email already registered. Please login."}), 400
        # Update pending user OTP
    else:
        # Create pending user
        user = User(
            email=email,
            is_verified=False
        )
        db.session.add(user)
        db.session.flush()  # Get ID without commit
    
    otp = generate_otp()
    user.otp_code = generate_password_hash(otp)

    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    
    username = "User"
    try:
        html_body = render_template("email/otp_email.html", otp=otp, username=username)
        success, error = send_email(email, "Your FableNest OTP Code", html_body)
        if not success:
            # Rollback on email fail
            db.session.rollback()
            current_app.logger.error(f"OTP send failed during send_otp: {error}")
            return jsonify({"error": f"Failed to send OTP: {error}"}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"OTP preparation failed: {e}")
        return jsonify({"error": "Failed to send OTP. Please try again."}), 500
    
    return jsonify({"message": "OTP sent! Enter it with your signup details.", "email": email}), 200

        
       


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10/minute")
def login():

    data=request.get_json()
    
    email=data.get("email")
    password=data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_verified:
        return jsonify({"error": "Email not verified"}), 403
    
    token=generate_session_token()
    device_info=get_device_info(request)
    ip_address = get_client_ip(request)
    user_session =UserSession(user_id=user.id, 
                            session_token=token, 
                            device_name=device_info["device_name"],
                            device_type=device_info["device_type"],
                            browser=device_info["browser"],
                            os=device_info["os"],
                            ip_address=ip_address,
                            location="Unknown",
                            last_activity=datetime.utcnow(),
                            expires_at=datetime.utcnow() + timedelta(days=7))
    db.session.add(user_session)
    db.session.commit()
    login_user(user)
    response=make_response(jsonify({"message": "Login successful", "user": user.id, "username": user.username, "email": user.email}))

    response.set_cookie("session_token",
                        token,
                        httponly=True,
                        secure=True,
                        samesite="Lax",
                        max_age=7*24*60*60)
    current_app.logger.info(f"Login successful")
    return response


@auth_bp.route("/resend-otp", methods=["POST"])
@limiter.limit("5/hour")
def resend_verification():
    data = request.get_json()
    if not data or "email" not in data:
        return jsonify({"error": "Email is required"}), 400    
    email = data["email"].strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No registration for this email. Send OTP first."}), 404
    if user.is_verified:
        return jsonify({"error": "Email already verified. Please login."}), 400
    new_otp = generate_otp()
    user.otp_code = generate_password_hash(new_otp)
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    username = "User"
    try:
        html_body = render_template("email/otp_email.html", otp=new_otp, username=username)
        success, error = send_email(email, "Resend FableNest OTP Code", html_body)
        if not success:
            db.session.rollback()
            current_app.logger.error(f"Resend OTP failed: {error}")
            return jsonify({"error": f"Failed to resend OTP: {error}"}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Resend OTP preparation failed: {e}")
        return jsonify({"error": "Failed to prepare resend OTP."}), 500
    return jsonify({"message": "New OTP sent to email!"}), 200



@auth_bp.route("set-username", methods=["POST"])
@login_required
def set_username():
    data = request.get_json()
    username = data.get("username", "").strip()

    if not username:
        return jsonify({"error": "username is required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 400
    
    current_user.username= username
    db.session.commit()
    return jsonify({"message": "Username set successfully", "username": username}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("session_token")
    if token:
        user_session = UserSession.query.filter_by(session_token=token, is_active=True).first()
        if user_session:
            user_session.is_active = False
            db.session.commit()
    logout_user()
    response = make_response(jsonify({"message": "Logout successful"}))
    response.delete_cookie("session_token")
    current_app.logger.info(f"Logout successful")
    return response

@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    if not current_user.is_authenticated:
        return jsonify({"user": None})
    return jsonify({"user":{
        "id": current_user.id,
        "username": current_user.username,
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "profile_picture": current_user.profile_picture
    }})

@auth_bp.route("forgot-password", methods=["POST"])
def forgot_password():
    data= request.get_json()
    email= data.get("email")
    user = User.query.filter_by(email=email).first()
    if user:
        success, error = send_reset_email(user)
        if not success:
            return jsonify({"error": f"Failed to send reset email: {error}"}), 500
    return jsonify({
        "message": "If account exists, password reset link sent."
    })

@auth_bp.route("reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")
    if not token or not new_password:
        return jsonify({"error": "Invalid request"}), 400
    email = verify_reset_token(token)
    if not email:
        return jsonify({"error": "Invalid or expired token"}), 400
    user = User.query.filter_by(email=email).first_or_404()
    if check_password_hash(user.password_hash, new_password):
        return jsonify({"error": "New password cannot be same as old password"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "password cannot be less than 6 characters"}), 400
    if not any(c.isalpha() for c in new_password) or not  any(c.isdigit() for c in new_password):
        return jsonify({"error": "Password must contain both letters and numbers"}), 400
    user.password_hash = generate_password_hash(new_password)
    UserSession.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return jsonify({"message": "Password reset successful"}), 200



@auth_bp.route("/debug-session", methods=["GET"])
def debug_session():
    print("SESSION CONTENTS:", dict(session))
    print("COOKIES:", dict(request.cookies))
    return jsonify({
        "session_keys": list(session.keys()),
        "session_data": dict(session),
        "cookies": dict(request.cookies)
    })


@socketio.on("connect")
def handle_connect():
    pass

