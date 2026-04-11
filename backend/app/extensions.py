from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_login import LoginManager
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_session import Session

db=SQLAlchemy()
migrate= Migrate()
login_manager=LoginManager()
socketio= SocketIO()
sess= Session()


# Initialize Flask-Mail
mail = Mail()

limiter= Limiter(
    key_func =lambda: "global"
)

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")