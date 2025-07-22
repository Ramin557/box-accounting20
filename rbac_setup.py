"""
RBAC Setup Utility
This module initializes the Role-Based Access Control system with default permissions and roles.
"""

from app import db
from models import Permission, Role, User
from datetime import datetime

def create_default_permissions():
    """Create default permissions for the system"""
    permissions_data = [
        # Customer Management
        {'name': 'view_customers', 'description': 'مشاهده لیست مشتریان', 'category': 'customers'},
        {'name': 'create_customers', 'description': 'افزودن مشتری جدید', 'category': 'customers'},
        {'name': 'edit_customers', 'description': 'ویرایش اطلاعات مشتریان', 'category': 'customers'},
        {'name': 'delete_customers', 'description': 'حذف مشتریان', 'category': 'customers'},
        {'name': 'export_customers', 'description': 'خروجی گرفتن از لیست مشتریان', 'category': 'customers'},
        
        # Product Management
        {'name': 'view_products', 'description': 'مشاهده لیست محصولات', 'category': 'products'},
        {'name': 'create_products', 'description': 'افزودن محصول جدید', 'category': 'products'},
        {'name': 'edit_products', 'description': 'ویرایش اطلاعات محصولات', 'category': 'products'},
        {'name': 'delete_products', 'description': 'حذف محصولات', 'category': 'products'},
        {'name': 'manage_inventory', 'description': 'مدیریت موجودی انبار', 'category': 'products'},
        {'name': 'export_products', 'description': 'خروجی گرفتن از لیست محصولات', 'category': 'products'},
        
        # Order Management
        {'name': 'view_orders', 'description': 'مشاهده لیست سفارشات', 'category': 'orders'},
        {'name': 'create_orders', 'description': 'ثبت سفارش جدید', 'category': 'orders'},
        {'name': 'edit_orders', 'description': 'ویرایش سفارشات', 'category': 'orders'},
        {'name': 'delete_orders', 'description': 'حذف سفارشات', 'category': 'orders'},
        {'name': 'approve_orders', 'description': 'تایید سفارشات', 'category': 'orders'},
        {'name': 'cancel_orders', 'description': 'لغو سفارشات', 'category': 'orders'},
        
        # Invoice Management
        {'name': 'view_invoices', 'description': 'مشاهده لیست فاکتورها', 'category': 'invoices'},
        {'name': 'create_invoices', 'description': 'صدور فاکتور جدید', 'category': 'invoices'},
        {'name': 'edit_invoices', 'description': 'ویرایش فاکتورها', 'category': 'invoices'},
        {'name': 'delete_invoices', 'description': 'حذف فاکتورها', 'category': 'invoices'},
        {'name': 'print_invoices', 'description': 'چاپ فاکتورها', 'category': 'invoices'},
        {'name': 'send_invoices', 'description': 'ارسال فاکتور به مشتری', 'category': 'invoices'},
        
        # Payment Management
        {'name': 'view_payments', 'description': 'مشاهده پرداخت‌ها', 'category': 'financial'},
        {'name': 'record_payments', 'description': 'ثبت پرداخت', 'category': 'financial'},
        {'name': 'edit_payments', 'description': 'ویرایش پرداخت‌ها', 'category': 'financial'},
        {'name': 'delete_payments', 'description': 'حذف پرداخت‌ها', 'category': 'financial'},
        
        # Reports
        {'name': 'view_reports', 'description': 'مشاهده گزارش‌ها', 'category': 'reports'},
        {'name': 'financial_reports', 'description': 'گزارش‌های مالی', 'category': 'reports'},
        {'name': 'sales_reports', 'description': 'گزارش‌های فروش', 'category': 'reports'},
        {'name': 'inventory_reports', 'description': 'گزارش‌های انبار', 'category': 'reports'},
        {'name': 'tax_reports', 'description': 'گزارش‌های مالیاتی', 'category': 'reports'},
        {'name': 'export_reports', 'description': 'خروجی گرفتن از گزارش‌ها', 'category': 'reports'},
        
        # Admin Functions
        {'name': 'manage_users', 'description': 'مدیریت کاربران', 'category': 'admin'},
        {'name': 'manage_roles', 'description': 'مدیریت نقش‌ها و دسترسی‌ها', 'category': 'admin'},
        {'name': 'view_system_settings', 'description': 'مشاهده تنظیمات سیستم', 'category': 'admin'},
        {'name': 'edit_system_settings', 'description': 'ویرایش تنظیمات سیستم', 'category': 'admin'},
        {'name': 'create_backups', 'description': 'تهیه نسخه پشتیبان', 'category': 'admin'},
        {'name': 'restore_backups', 'description': 'بازگردانی نسخه پشتیبان', 'category': 'admin'},
        {'name': 'view_audit_logs', 'description': 'مشاهده لاگ‌های سیستم', 'category': 'admin'},
        {'name': 'admin_panel', 'description': 'دسترسی به پنل مدیریت', 'category': 'admin'},
    ]
    
    created_permissions = []
    for perm_data in permissions_data:
        # Check if permission already exists
        existing_perm = Permission.query.filter_by(name=perm_data['name']).first()
        if not existing_perm:
            permission = Permission(**perm_data)
            db.session.add(permission)
            created_permissions.append(permission)
    
    return created_permissions

def create_default_roles():
    """Create default roles with appropriate permissions"""
    # Get all permissions
    all_permissions = Permission.query.all()
    permissions_dict = {p.name: p for p in all_permissions}
    
    # Define roles and their permissions
    roles_data = [
        {
            'name': 'super_admin',
            'display_name': 'مدیر ارشد',
            'description': 'دسترسی کامل به تمامی بخش‌های سیستم',
            'is_system_role': True,
            'permissions': [p.name for p in all_permissions]  # All permissions
        },
        {
            'name': 'admin', 
            'display_name': 'مدیر سیستم',
            'description': 'دسترسی به اکثر بخش‌های سیستم به جز تنظیمات حساس',
            'is_system_role': True,
            'permissions': [
                # Customer Management
                'view_customers', 'create_customers', 'edit_customers', 'delete_customers', 'export_customers',
                # Product Management
                'view_products', 'create_products', 'edit_products', 'delete_products', 'manage_inventory', 'export_products',
                # Order Management
                'view_orders', 'create_orders', 'edit_orders', 'delete_orders', 'approve_orders', 'cancel_orders',
                # Invoice Management
                'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices', 'print_invoices', 'send_invoices',
                # Payment Management
                'view_payments', 'record_payments', 'edit_payments', 'delete_payments',
                # Reports
                'view_reports', 'financial_reports', 'sales_reports', 'inventory_reports', 'tax_reports', 'export_reports',
                # Limited Admin Functions
                'manage_users', 'view_system_settings', 'create_backups', 'view_audit_logs'
            ]
        },
        {
            'name': 'accountant',
            'display_name': 'حسابدار',
            'description': 'دسترسی به عملیات مالی و گزارش‌گیری',
            'is_system_role': True,
            'permissions': [
                # Customer Management (limited)
                'view_customers', 'create_customers', 'edit_customers', 'export_customers',
                # Product Management (limited)
                'view_products', 'export_products',
                # Order Management (limited)
                'view_orders', 'create_orders', 'edit_orders',
                # Invoice Management (full)
                'view_invoices', 'create_invoices', 'edit_invoices', 'print_invoices', 'send_invoices',
                # Payment Management (full)
                'view_payments', 'record_payments', 'edit_payments',
                # Reports (full)
                'view_reports', 'financial_reports', 'sales_reports', 'inventory_reports', 'tax_reports', 'export_reports'
            ]
        },
        {
            'name': 'sales_person',
            'display_name': 'فروشنده',
            'description': 'دسترسی به ثبت سفارش و مدیریت مشتریان',
            'is_system_role': True,
            'permissions': [
                # Customer Management (full)
                'view_customers', 'create_customers', 'edit_customers', 'export_customers',
                # Product Management (view only)
                'view_products',
                # Order Management (full)
                'view_orders', 'create_orders', 'edit_orders',
                # Invoice Management (view only)
                'view_invoices', 'print_invoices',
                # Reports (limited)
                'view_reports', 'sales_reports'
            ]
        },
        {
            'name': 'warehouse_manager',
            'display_name': 'مدیر انبار',
            'description': 'دسترسی به مدیریت موجودی و محصولات',
            'is_system_role': True,
            'permissions': [
                # Product Management (full)
                'view_products', 'create_products', 'edit_products', 'manage_inventory', 'export_products',
                # Order Management (limited)
                'view_orders', 'edit_orders',
                # Reports (inventory focused)
                'view_reports', 'inventory_reports', 'export_reports'
            ]
        }
    ]
    
    created_roles = []
    for role_data in roles_data:
        # Check if role already exists
        existing_role = Role.query.filter_by(name=role_data['name']).first()
        if existing_role:
            continue
            
        # Create role
        role = Role(
            name=role_data['name'],
            display_name=role_data['display_name'],
            description=role_data['description'],
            is_system_role=role_data['is_system_role']
        )
        
        # Add permissions to role
        for perm_name in role_data['permissions']:
            if perm_name in permissions_dict:
                role.permissions.append(permissions_dict[perm_name])
        
        db.session.add(role)
        created_roles.append(role)
    
    return created_roles

def migrate_existing_users():
    """Migrate existing users to the new RBAC system"""
    admin_role = Role.query.filter_by(name='admin').first()
    accountant_role = Role.query.filter_by(name='accountant').first()
    
    if not admin_role or not accountant_role:
        print("خطا: نقش‌های پایه یافت نشدند.")
        return
    
    users = User.query.all()
    migrated_count = 0
    
    for user in users:
        if user.role_id is None:  # Only migrate users without role_id
            if user.role == 'admin':
                user.role_id = admin_role.id
                migrated_count += 1
            elif user.role == 'accountant':
                user.role_id = accountant_role.id
                migrated_count += 1
    
    print(f"تعداد {migrated_count} کاربر به سیستم جدید منتقل شدند.")
    return migrated_count

def create_sample_users():
    """Create sample users for demonstration purposes"""
    if User.query.filter(User.username != 'admin').count() > 0:
        return

    sales_role = Role.query.filter_by(name='sales_person').first()
    warehouse_role = Role.query.filter_by(name='warehouse_manager').first()

    sample_users = [
        {'username': 'ali_rezaei', 'full_name': 'علی رضایی', 'email': 'ali@example.com', 'password': 'password', 'role': sales_role},
        {'username': 'maryam_ahmadi', 'full_name': 'مریم احمدی', 'email': 'maryam@example.com', 'password': 'password', 'role': warehouse_role},
    ]

    for user_data in sample_users:
        user = User(
            username=user_data['username'],
            full_name=user_data['full_name'],
            email=user_data['email'],
            role_id=user_data['role'].id if user_data['role'] else None
        )
        user.set_password(user_data['password'])
        db.session.add(user)

    db.session.commit()

def init_rbac_system():
    """Initialize the complete RBAC system"""
    print("در حال راه‌اندازی سیستم کنترل دسترسی...")
    
    try:
        # Create permissions
        permissions = create_default_permissions()
        print(f"تعداد {len(permissions)} دسترسی جدید ایجاد شد.")
        
        # Commit permissions first
        db.session.commit()
        
        # Create roles
        roles = create_default_roles()
        print(f"تعداد {len(roles)} نقش جدید ایجاد شد.")
        
        # Commit roles
        db.session.commit()
        
        # Migrate existing users
        migrated_users = migrate_existing_users()
        
        # Create sample users
        create_sample_users()

        # Final commit
        db.session.commit()
        
        print("سیستم کنترل دسترسی با موفقیت راه‌اندازی شد!")
        print(f"نقش‌های ایجاد شده: {[r.display_name for r in roles]}")
        
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"خطا در راه‌اندازی سیستم: {str(e)}")
        return False

if __name__ == "__main__":
    from app import app
    with app.app_context():
        db.create_all()
        init_rbac_system()