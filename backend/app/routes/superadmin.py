from flask import Blueprint, jsonify, request, make_response
from flask_login import current_user, login_user
from werkzeug.security import check_password_hash
from app.utils import super_admin_required, generate_session_token, get_device_info, get_client_ip
from app.models import User, UserSession
from app.extensions import db
from datetime import datetime, timedelta

superadmin_bp = Blueprint("superadmin", __name__, url_prefix="/api/superadmin")

@superadmin_bp.route("/users", methods=["GET"])
@super_admin_required
def get_all_users():
    users = User.query.all()
    return jsonify({"users": [user.serialize() for user in users]}), 200

@superadmin_bp.route("/login", methods=["POST"])
def superadmin_login():
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
    if not user.is_super_admin:
        return jsonify({"error": "Superadmin credentials required"}), 403
    
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
        "message": "Superadmin login successful", 
        "user": {
            "id": user.id, 
            "username": user.username, 
            "email": user.email
        }
    }))
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="Lax", max_age=7*24*60*60)
    return response
    

@superadmin_bp.route("/admins", methods=["GET"])
@super_admin_required
def get_all_admins():
    admins = User.query.filter_by(is_admin=True, is_super_admin=False).all()
    return jsonify({"users": [user.serialize() for user in admins]}), 200
    
@superadmin_bp.route("/superadmins", methods = ["GET"])
@super_admin_required
def get_all_superadmins():
    superadmins = User.query.filter_by(is_super_admin=True).all()
    return jsonify({"users": [user.serialize() for user in superadmins]}), 200

@superadmin_bp.route("/users/<int:user_id>/make-admin", methods=["POST"])
@super_admin_required
def make_admin(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({"error": "You cannot modidfy your own role"}), 400
    user.is_admin = True
    db.session.commit()
    return jsonify({"message": "User promoted to admin!"}), 200

@superadmin_bp.route("/users/<int:user_id>/make-super-admin", methods=["POST"])
@super_admin_required
def make_super_admin(user_id):
    user=User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({"error": "You cannot modidfy your own role"}), 400
    user.is_admin = True
    user.is_super_admin = True
    db.session.commit()
    return jsonify({"message": "User promoted to superadmin"}), 200

@superadmin_bp.route("/users/<int:user_id>/remove-admin", methods=["POST"])
@super_admin_required
def remove_admin(user_id):
    user=User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({"error": "You cannot modidfy your own role"}), 400
    user.is_admin = False
    user.is_super_admin = False
    db.session.commit()
    return jsonify({"message": "Admin rights removed"}), 200
    
@superadmin_bp.route("/users/<int:user_id>/ban", methods=["POST"])
@super_admin_required
def ban_user(user_id):
    user=User.query.get_or_404(user_id)
    data = request.get_json()
    reason= data.get("reason", "")
    user.is_banned=True
    user.ban_reason = reason
    user.banned_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "User banned"}), 200

@superadmin_bp.route("/users/<int:user_id>/suspend", methods=["POST"])
@super_admin_required
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

@superadmin_bp.route("/users/<int:user_id>/unban", methods=["POST"])
@super_admin_required
def unban_user(user_id):
    user=User.query.get_or_404(user_id)

    user.is_banned=False
    user.ban_reason = None
    user.banned_at = None
    db.session.commit()
    return jsonify({"message": "User unbanned"}), 200

@superadmin_bp.route("/users/<int:user_id>/unsuspend", methods=["POST"])
@super_admin_required
def unsuspend_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_suspended = False
    user.suspend_until = None
    db.session.commit()
    return jsonify({"message": "User sespension removed"}), 200

@superadmin_bp.route("/dashboard", methods=["POST"])
@super_admin_required
def sup_admin_dashboard(user_id):
    user = User.query.get_or_404(user_id)
    if not (user.is_admin or user.is_super_admin):
        return jsonify({"error": "Access denied"}), 403
    total_users = User.query.count()
    total_admins = User.query.filter(User.is_admin==True).count()
    return jsonify({
        "users": total_users,
        "admins": total_admins
    }), 200
