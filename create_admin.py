from app import app, db
from models import User, Role
from flask import Flask

def create_admin_user():
    with app.app_context():
        # Check if admin user already exists
        admin = User.query.filter_by(username='admin').first()
        if admin:
            print("Admin user already exists!")
            return
        
        # Check if admin role exists
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            # Create admin role if it doesn't exist
            admin_role = Role(name='admin', display_name='مدیر سیستم', 
                              description='دسترسی کامل به تمام بخش‌های سیستم', 
                              is_system_role=True)
            db.session.add(admin_role)
            db.session.commit()
            print("Created admin role")
        
        # Create admin user
        admin_user = User(username='admin', 
                         email='admin@example.com', 
                         full_name='مدیر سیستم',
                         role_id=admin_role.id,
                         role='admin',  # Legacy role field
                         is_active=True)
        admin_user.set_password('admin123')
        
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully!")
        print(f"Username: admin")
        print(f"Password: admin123")

if __name__ == '__main__':
    create_admin_user()