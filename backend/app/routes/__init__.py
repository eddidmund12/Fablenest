from flask import Blueprint
from .auth import auth_bp
from .main import main_bp
from .users_rt import users_bp
from .admin import admin_bp
from .superadmin import superadmin_bp
from .image import image_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(superadmin_bp)
    app.register_blueprint(image_bp)
