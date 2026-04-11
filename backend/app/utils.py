import os
from itsdangerous import URLSafeTimedSerializer
from flask import Flask, Blueprint, session, redirect,request, flash,current_app,wrappers, jsonify, url_for, render_template
from functools import wraps
from flask_login import current_user
from datetime import datetime, timedelta
from flask_mail import Message
from user_agents import parse
import sqlalchemy, flask_login, flask_sqlalchemy, flask_migrate, psycopg2
import secrets
import re
import unicodedata
import math
import random
from app.extensions import mail

def data_validation(firstname, middlename, lastname, email, password, confirmpassword):
    errors = []

    if not all([firstname,lastname,email,password,confirmpassword]):
        errors.append("all fields are required")

    if len(firstname) < 2:
        errors.append("Enter a valid name")
    if len(lastname) < 2:
        errors.append("Lastname not valid")
    if len(password) < 6:
        errors.append("Password must not be less than 6 characters")
    if "@" not in email:
        errors.append("Invalid Email format")
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        errors.append("Invalid email format")
    if password != confirmpassword:
        errors.append("Passwords do not match")
    if not any(c.isalpha() for c in password) or not  any(c.isdigit() for c in password):
        errors.append("Password must contain alphabets and numbers")
    return jsonify({"errors": errors})




def role_required(required_role, user_id):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if user_id not in session:
                return jsonify({"error": "Login required"}), 401
            if session.get("role") != required_role:
                return jsonify({"error": "Access denied"}), 404
            return f(*args, **kwargs)
        return wrapper
    return decorator
            
def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Authentication required"}), 401
        if not current_user.is_admin:
            return jsonify({"error": "You don't have access to this page"}), 403
        return f(*args, **kwargs)
    return wrapper

def super_admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Authentication required"}), 401
        if not current_user.is_super_admin:
            return jsonify({"error": "Restricted access!"}), 403
        return f(*args, **kwargs)
    return wrapper

def generate_otp():
    import secrets
    return str(secrets.randbelow(900000) + 100000)

def clear_user_otp(user):  
    from app.models import db
    user.otp_code = None
    user.otp_expiry = None
    db.session.commit()

def validate_otp(user, otp_input):    
    from werkzeug.security import check_password_hash
    from datetime import datetime
    
    if not user.otp_code or not user.otp_expiry:
        current_app.logger.error("No OTP sent")
        return False, "No OTP found. Send OTP first."
    
    if datetime.utcnow() > user.otp_expiry:
        current_app.logger.warning("OTP expired")
        return False, "OTP expired."
    
    if not check_password_hash(user.otp_code, otp_input):
        current_app.logger.warning("Invalid OTP")
        return False, "Invalid OTP."
    
    current_app.logger.info("OTP validated successfully")
    return True, None

def send_email(to_email, subject, body):
    try:
        sender_email = os.getenv("MAIL_USERNAME")
        if not sender_email:
            return False, "MAIL_USERNAME not set in environment"
        
        msg = Message(
            subject=subject,
            sender=sender_email,
            recipients=[to_email],
            html=body
        )
        mail.send(msg)
        current_app.logger.info(f"Email sent successfully to {to_email}")
        return True, None
    except Exception as e:
        error_msg = str(e)
        current_app.logger.error(f"Email send failed to {to_email}: {error_msg}")
        return False, error_msg

def send_otp_email(user_email, otp):
    try:
        from app.models import User
        from app.extensions import db
        from werkzeug.security import generate_password_hash
        user = User.query.filter_by(email=user_email).first()
        if user:
            user.otp_code = generate_password_hash(otp)
            user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
            db.session.commit()
            username = f"{user.firstname} {user.lastname}" if user and user.firstname else "User"
            html_body = render_template("email/otp_email.html", otp=otp, username=username)        
            return send_email(user_email, "Your FableNest OTP Verification Code", html_body)
    except Exception as e:
        current_app.logger.error(f"OTP email preparation failed: {e}")
        return False

def send_resend_otp_email(user):
    try:
        from app.models import db
        from werkzeug.security import generate_password_hash
        otp = generate_otp()
        user.otp_code = generate_password_hash(otp)
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        db.session.commit()
        username = f"{user.firstname} {user.lastname}" if user.firstname else "User"
        html_body = render_template("email/otp_email.html", otp=otp, username=username)
        return send_email(user.email, "Your Resend Verification OTP - FableNest", html_body)
    except Exception as e:
        jsonify({"error": "Failed to send OTP"})
        current_app.logger.error(f"Resend OTP email failed: {e}")
        return False


def generate_verification_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt="email-verification")


def send_verification_email(user):
    token = generate_verification_token(user.email)
    verification_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
    username = f"{user.firstname} {user.lastname}" if user.firstname else "User"
    html_body = f"""
<html>

<body>
    <h2>Hello {username},</h2>
    <p>Thank you for registering. Please verify your email by clicking the link below:</p>
    <a href="{verification_url}">Verify Email</a>
    <p>This link expires in 1 hour.</p>
</body>
</html>
    """
    return send_email(user.email, "Verify Your Email - FableNest", html_body)


def create_notifications(user_id, actor_id, message, type, post_id=None):
    from app.models import Notification, db
    from app.extensions import socketio
    notification = Notification(user_id=user_id, actor_id=actor_id, type=type, post_id=post_id, message=message)
    db.session.add(notification)
    db.session.commit()

    socketio.emit("new_notification", {
        "type":type,
        "actor_id":actor_id,
        "post_id":post_id,
        "message": message
    }, room=f"user_{user_id}"
    )

def get_client_ip(request):
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.remote_addr

def get_location_from_ip(ip_address):
    return "Unknown Location"

def generate_session_token():
    return secrets.token_urlsafe(32)

def get_device_info(request):
    ua=parse(request.headers.get("User-Agent"))
    return {
        "device_type":"mobile" if ua.is_mobile else "tablet" if ua.is_tablet else "desktop",
        "browser": ua.browser.family, "os": ua.os.family,
        "device_name": ua.device.family or "Unknown device"
    }


def slugify(text):
    """Convert text to a URL-friendly slug"""
    if not text:
        return ""
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    # Convert to lowercase and replace spaces with hyphens
    text = re.sub(r'[^\w\s-]', '', text).lower().strip()
    text = re.sub(r'[-\s]+', '-', text)
    return text

def calculate_reading_time(content):

    if not content:
        return 1
    words = content.split()
    word_count = len(words)
    reading_time = math.ceil(word_count / 200)
    return reading_time

def calculate_trending_score(post):
    score= (post.views + len(post.comments) * 3 + post.likes_count * 5)
    return score

def track_post_view(post):
    from app.models import PostView
    from app.extensions import db

    ip = request.remote_addr
    time_limit = datetime.utcnow() - timedelta(hours=1)
    existing_view=PostView.query.filter(PostView.post_id == post.id, PostView.ip_address == ip, PostView.viewed_at >= time_limit).first()

    if existing_view:
        return
    view = PostView(post_id=post.id, user_id=current_user.id if current_user.is_authenticated else None, ip_address=ip)
    db.session.add(view)
    db.session.commit()

def check_user_status():
    from app.extensions import db
    if not current_user.is_authenticated:
        return None
    if current_user.is_banned:
        return jsonify({
            "error": "Your account has been banned",
            "reason": current_user.ban_reason
        }), 403
    if current_user.is_suspended:
        if current_user.suspend_until and datetime.utcnow() < current_user.suspend_until:
            return jsonify({"error": "Account suspended",
                            "until": current_user.suspend_until}), 403
        else:
            current_user.is_suspended = False
            current_user.suspend_until = None
            db.session.commit()
    return None

def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt="password-reset")

def verify_reset_token(token, expiration=3600):
    serializer= URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email= serializer.loads(token, salt="password-reset", max_age=expiration)
        return email
    except Exception:
        return None
    
def send_reset_email(user):
    token = generate_reset_token(user.email)
    reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    username = f"{user.firstname} {user.lastname}" if user.firstname else "User"
    html_body = f"""
<html>
<body>
    <h2>Password Reset Request</h2>
    <p>Hello {username},</p>
    <p>Click the link below to reset your password:</p>
    <a href="{reset_url}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
</body>
</html>
    """
    return send_email(user.email, "Password Reset - FableNest", html_body)
