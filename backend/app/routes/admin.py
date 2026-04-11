from flask import Blueprint, request, jsonify, make_response
from flask_login import login_user
from werkzeug.security import check_password_hash
from app.utils import admin_required, generate_session_token, get_device_info, get_client_ip
from app.models import User, Post, UserSession
from app.extensions import db
from datetime import datetime, timedelta
from app.serializers.user_serializer import serialize_user

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_verified:
        return jsonify({"error": "Email not verified"}), 403
    if not user.is_admin:
        return jsonify({"error": "Admin credentials required"}), 403
    
    token = generate_session_token()
    device_info = get_device_info(request)
    ip_address = get_client_ip(request)
    session = UserSession(
        user_id=user.id, 
        session_token=token, 
        device_name=device_info["device_name"],
        device_type=device_info["device_type"],
        browser=device_info["browser"],
        os=device_info["os"],
        ip_address=ip_address,
        location="Unknown",
        last_activity=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(session)
    db.session.commit()

    login_user(user)
    response = make_response(jsonify({
        "message": "Admin login successful", 
        "user": {
            "id": user.id, 
            "username": user.username, 
            "email": user.email
        }
    }))
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="Lax", max_age=7*24*60*60)
    return response

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    users = User.query.all()
    if users.is_admin == False and users.is_super_admin == False:
        return jsonify({
            "users": [serialize_user(user) for user in users]
        }), 200

@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200

@admin_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@admin_required 
def delete_post(post_id):
    post=Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted"}), 200

@admin_bp.route("/users/<int:user_id>/ban", methods=["POST"])
@admin_required
def ban_user(user_id):
    user=User.query.get_or_404(user_id)
    data = request.get_json()
    reason= data.get("reason", "")
    user.is_banned=True
    user.ban_reason = reason
    user.banned_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "User banned"}), 200

@admin_bp.route("/users/<int:user_id>/suspend", methods=["POST"])
@admin_required
def suspend_user(user_id):
    user=User.query.get_or_404(user_id)
    data = request.get_json()
    days = data.get("days", 7)
    user.is_suspended = True
    user.suspended_until = datetime.utcnow() + timedelta(days=days)
    db.session.commit()
    return jsonify({
        "message": f"User suspended for {days} days"
    }), 200

@admin_bp.route("/users/<int:user_id>/unban", methods=["POST"])
@admin_required
def unban_user(user_id):
    user=User.query.get_or_404(user_id)

    user.is_banned=False
    user.ban_reason = None
    user.banned_at = None
    db.session.commit()
    return jsonify({"message": "User unbanned"}), 200

@admin_bp.route("/users/<int:user_id>/unsuspend", methods=["POST"])
@admin_required
def unsuspend_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_suspended = False
    user.suspend_until = None
    db.session.commit()
    return jsonify({"message": "User sespension removed"}), 200