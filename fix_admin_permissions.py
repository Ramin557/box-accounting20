#!/usr/bin/env python3
"""
Admin Permissions Fix Script
اسکریپت تصحیح دسترسی‌های admin

این اسکریپت اطمینان می‌دهد که کاربر admin همیشه دسترسی کامل super_admin دارد.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_admin_permissions():
    """تصحیح دسترسی‌های admin"""
    print("🔧 شروع تصحیح دسترسی‌های admin...")
    
    try:
        from app import app, db
        from models import User, Role
        
        with app.app_context():
            # Find admin user
            admin_user = User.query.filter_by(username='admin').first()
            if not admin_user:
                print("❌ کاربر admin یافت نشد")
                return False
            
            # Find super_admin role
            super_admin_role = Role.query.filter_by(name='super_admin').first()
            if not super_admin_role:
                print("❌ نقش super_admin یافت نشد")
                return False
            
            # Fix admin role assignment
            if admin_user.role_id != super_admin_role.id:
                print(f"🔄 تغییر نقش admin از {admin_user.role_id} به {super_admin_role.id}")
                admin_user.role_id = super_admin_role.id
                admin_user.role = 'admin'  # Legacy compatibility
                admin_user.is_active = True
                db.session.commit()
                print("✅ نقش admin تصحیح شد")
            else:
                print("✅ admin از قبل نقش صحیح دارد")
            
            # Verify permissions
            if admin_user.user_role and admin_user.user_role.permissions:
                permission_count = len(admin_user.user_role.permissions)
                print(f"✅ admin دارای {permission_count} دسترسی است")
                
                # List some key permissions
                key_permissions = ['manage_users', 'manage_roles', 'view_reports', 'manage_customers']
                for perm in key_permissions:
                    has_perm = admin_user.has_permission(perm)
                    status = "✅" if has_perm else "❌"
                    print(f"   {status} {perm}")
            else:
                print("❌ admin هیچ دسترسی ندارد")
                return False
            
            print("🎉 دسترسی‌های admin با موفقیت تصحیح شد!")
            return True
            
    except Exception as e:
        print(f"❌ خطا در تصحیح دسترسی‌ها: {e}")
        return False

if __name__ == "__main__":
    success = fix_admin_permissions()
    if not success:
        sys.exit(1)
    
    print("\n📋 نحوه استفاده:")
    print("   - این اسکریپت را هر زمان که نیاز دارید اجرا کنید")
    print("   - پس از جابجایی فایل‌ها یا تغییر ساختار دیتابیس")
    print("   - برای اطمینان از دسترسی کامل admin")
    print("\n🔑 اطلاعات ورود:")
    print("   نام کاربری: admin")
    print("   رمز عبور: admin123")