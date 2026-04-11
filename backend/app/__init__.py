import os
from flask import Flask, request,session, jsonify, Blueprint,send_from_directory
from flask_cors import CORS
from flask_login import current_user,login_user
from datetime import datetime
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from app.extensions import db, migrate, socketio, limiter, login_manager, mail, sess
from app.models import UserSession
from app.routes import register_blueprints 
from app.utils import check_user_status
from flask_talisman import Talisman
import cloudinary

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    # Mail configuration
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

    BASE_DIR= os.path.abspath(os.path.dirname(__file__))
    app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
    app.config["MAX_CONTENT_LENGTH"]= 50 * 1024 * 1024
    app.config["ALLOWED_IMAGE_EXTENSIONS"] = {"png", "jpg", "jpeg"}
    app.config["ALLOWED_VIDEO_EXTENSIONS"] = {"mp4", "mov", "avi", "mkv"}

    app.config.from_object('app.config.Config')

    cloudinary.config(
        cloud_name=app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key=app.config.get('CLOUDINARY_API_KEY'),
        api_secret=app.config.get('CLOUDINARY_API_SECRET')
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    
     # ✅ Flask-Session config — add these
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    socketio.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    sess.init_app(app)
   
    # User loader callback for Flask-Login
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Import and register blueprint after extensions are initialized
    register_blueprints(app)
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return (
            jsonify({"error": "Too many requests"}),
            429
        )

    @app.errorhandler(400)
    def bad_request_handler(e):
        return (
            jsonify({
                "error": "Bad Request", 
                "message": "Invalid request data. Verify JSON format and Content-Type header."
            }), 
            400
        )
    
    @app.before_request
    def load_user_from_cookie():
        if current_user.is_authenticated:
            return
        token=request.cookies.get("session_token")
        if not token:
            return
        user_session= UserSession.query.filter_by(session_token=token, is_active=True).first()
        if not user_session:
            return
        if user_session.expires_at < datetime.utcnow():
            user_session.is_active = False
            db.session.commit()
            return
        user_session.last_activity = datetime.utcnow()
        db.session.commit()
        login_user(user_session.user)

    @app.before_request
    def require_username_api():
        if current_user.is_authenticated:
            allowed_routes = ["auth.set_username", "auth.logout", "auth.resend_verification", "auth.login", "auth.send_otp", "auth.register", "static"]
            if not current_user.username and request.endpoint not in allowed_routes:
                return jsonify({"error": "Username required", "action": "set_username"}), 403
            

    @app.before_request
    def block_banned_users():
        response = check_user_status()
        if response:
            return response
    

    csp = {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
        "video-src": ["'self'", "data:", "https://res.cloudinary.com"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"]
    }

    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    CORS(app, supports_credentials=True, origins=allowed_origins)

    # Talisman(
    # app, 
    # content_security_policy=csp, 
    # force_https=False,
    # strict_transport_security=False,   # 👈 disable in dev
    # session_cookie_secure=False,
    # session_cookie_http_only=True,
    # frame_options=None                 # 👈 add this
    # )
    
    


    return app

