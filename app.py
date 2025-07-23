import os
import os.path
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_migrate import Migrate
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()
csrf = CSRFProtect()
migrate = Migrate()

# Create the app
app = Flask(__name__, instance_relative_config=True)
app.secret_key = os.environ.get("SECRET_KEY", "your-secret-key-for-development")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Ensure the instance folder exists
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "instance")
try:
    os.makedirs(instance_path)
except OSError:
    pass

# Configure the database - Use SQLite for now
database_url = "sqlite:///" + os.path.join(instance_path, "accounting.db")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)
login_manager.init_app(app)
csrf.init_app(app)
login_manager.login_view = 'login'  # type: ignore
login_manager.login_message = 'لطفاً برای دسترسی به این صفحه وارد شوید.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Import models here to avoid circular imports
import models  # noqa: F401

with app.app_context():
    # Create all tables
    db.create_all()

@app.cli.command("seed-db")
def seed_db_command():
    """ایجاد داده‌های اولیه برای دیتابیس."""
    from models import User, Role, Permission
    
    print("در حال ایجاد داده‌های اولیه...")
    
    # Check if admin user exists
    admin_user = User.query.filter_by(username='admin').first()
    if admin_user:
        print('✅ کاربر admin از قبل وجود دارد.')
        return

    # Import and run RBAC setup
    try:
        import rbac_setup
        rbac_setup.setup_rbac()
        print('✅ سیستم دسترسی‌ها راه‌اندازی شد.')
    except Exception as e:
        print(f'⚠️ خطا در راه‌اندازی دسترسی‌ها: {e}')

    # Create admin role if not exists
    admin_role = Role.query.filter_by(name='Super Admin').first()
    if not admin_role:
        admin_role = Role(
            name='Super Admin',
            display_name='مدیر ارشد',
            description='دسترسی کامل به تمام امکانات سیستم'
        )
        db.session.add(admin_role)
        db.session.flush()

    # Create admin user
    password_hash = generate_password_hash('admin123')
    admin_user = User(
        username='admin',
        email='admin@example.com',
        password_hash=password_hash,
        full_name='مدیر سیستم',
        role_id=admin_role.id,
        is_active=True
    )
    
    db.session.add(admin_user)
    db.session.commit()
    
    print('✅ کاربر admin با موفقیت ایجاد شد')
    print('📋 اطلاعات ورود:')
    print('   نام کاربری: admin')
    print('   رمز عبور: admin123')
    print('✅ سیستم آماده است!')

