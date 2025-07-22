#!/usr/bin/env python3
"""
اسکریپت استقرار برای سیستم حسابداری فارسی
Persian Accounting System Deployment Script

این فایل را هر وقت پروژه را در محیط جدیدی اجرا می‌کنید، اجرا کنید:
python deploy.py

Run this script whenever you deploy the project to a new environment:
python deploy.py
"""

import os
import sys
from werkzeug.security import generate_password_hash

def setup_database():
    """راه‌اندازی دیتابیس و ایجاد جداول"""
    print("🔧 در حال راه‌اندازی دیتابیس...")
    
    # Import app and models
    from app import app, db
    import models  # This will register all models
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ جداول دیتابیس ایجاد شدند")
            return True
        except Exception as e:
            print(f"❌ خطا در ایجاد جداول: {e}")
            return False

def setup_rbac():
    """راه‌اندازی سیستم کنترل دسترسی"""
    print("🔐 در حال راه‌اندازی سیستم دسترسی‌ها...")
    
    from app import app
    
    with app.app_context():
        try:
            import rbac_setup
            rbac_setup.init_rbac_system()
            print("✅ سیستم دسترسی‌ها راه‌اندازی شد")
            return True
        except Exception as e:
            print(f"❌ خطا در راه‌اندازی دسترسی‌ها: {e}")
            return False

def create_admin_user():
    """ایجاد کاربر مدیر"""
    print("👤 در حال ایجاد کاربر مدیر...")
    
    from app import app, db
    from models import User, Role
    
    with app.app_context():
        try:
            # Get Super Admin role (try both possible names)
            admin_role = Role.query.filter_by(name='super_admin').first()
            if not admin_role:
                admin_role = Role.query.filter_by(name='Super Admin').first()
            
            if not admin_role:
                print("❌ نقش super_admin یافت نشد")
                return False

            # Check if admin user exists
            admin_user = User.query.filter_by(username='admin').first()
            
            if admin_user:
                print("ℹ️  کاربر admin از قبل وجود دارد")
                
                # Always ensure admin has correct super_admin role access
                if admin_user.role_id != admin_role.id:
                    print("🔧 در حال تصحیح دسترسی admin...")
                    admin_user.role_id = admin_role.id
                    admin_user.is_active = True
                    # Update legacy role field for compatibility
                    admin_user.role = 'admin'
                    db.session.commit()
                    print("✅ دسترسی admin به super_admin تصحیح شد")
                
                # Verify permissions
                if admin_user.user_role and admin_user.user_role.permissions:
                    permission_count = len(admin_user.user_role.permissions)
                    print(f"✅ admin دارای {permission_count} دسترسی است")
                else:
                    print("⚠️  هشدار: admin دسترسی‌های لازم ندارد")
                
                return True

            # Create new admin user
            password_hash = generate_password_hash('admin123')
            admin_user = User(
                username='admin',
                email='admin@example.com',
                password_hash=password_hash,
                full_name='مدیر سیستم',
                role_id=admin_role.id,
                role='admin',  # Legacy compatibility
                is_active=True
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
            print("✅ کاربر admin ایجاد شد")
            print("📋 اطلاعات ورود:")
            print("   نام کاربری: admin")
            print("   رمز عبور: admin123")
            print(f"   نقش: {admin_role.display_name}")
            return True
            
        except Exception as e:
            print(f"❌ خطا در ایجاد کاربر admin: {e}")
            return False

def check_environment():
    """بررسی محیط و متغیرهای مورد نیاز"""
    print("🔍 در حال بررسی محیط...")
    
    # Check DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("⚠️  DATABASE_URL تنظیم نشده است")
        print("🔧 در حال بررسی فایل .env...")
        
        if os.path.exists('.env'):
            print("✅ فایل .env یافت شد")
        else:
            print("❌ فایل .env یافت نشد")
            return False
    else:
        print("✅ DATABASE_URL تنظیم شده است")
    
    return True

def main():
    """تابع اصلی اجرای اسکریپت"""
    print("🚀 شروع راه‌اندازی سیستم حسابداری فارسی")
    print("=" * 50)
    
    # Step 1: Check environment
    if not check_environment():
        print("❌ محیط آماده نیست")
        sys.exit(1)
    
    # Step 2: Setup database
    if not setup_database():
        print("❌ راه‌اندازی دیتابیس ناموفق")
        sys.exit(1)
    
    # Step 3: Setup RBAC
    if not setup_rbac():
        print("❌ راه‌اندازی دسترسی‌ها ناموفق")
        sys.exit(1)
    
    # Step 4: Create admin user
    if not create_admin_user():
        print("❌ ایجاد کاربر مدیر ناموفق")
        sys.exit(1)
    
    print("=" * 50)
    print("🎉 سیستم با موفقیت راه‌اندازی شد!")
    print("🌐 برای اجرای اپلیکیشن:")
    print("   python main.py")
    print("📱 دسترسی به سیستم: http://localhost:5000")

if __name__ == "__main__":
    main()