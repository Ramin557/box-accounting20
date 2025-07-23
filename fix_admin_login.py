#!/usr/bin/env python3
from app import app, db
from models import User
from werkzeug.security import generate_password_hash

with app.app_context():
    # Check if admin user exists
    admin = User.query.filter_by(username='admin').first()
    
    if admin:
        print(f'Admin user found: {admin.username}')
        print(f'Admin email: {admin.email}')
        print(f'Admin role: {admin.role}')
        
        # Reset password to 'admin123'
        admin.password_hash = generate_password_hash('admin123')
        db.session.commit()
        print('✓ Password reset to: admin123')
        
    else:
        # Create new admin user
        print('Creating new admin user...')
        admin = User(
            username='admin',
            email='admin@company.com',
            full_name='مدیر کل سیستم',
            role='super_admin',
            password_hash=generate_password_hash('admin123'),
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print('✓ Admin user created')
        print('Username: admin')
        print('Password: admin123')
        print('Role: super_admin')

    # Also check for any other users
    all_users = User.query.all()
    print(f'\nTotal users in system: {len(all_users)}')
    for user in all_users:
        print(f'- {user.username} ({user.role}) - {user.full_name}')