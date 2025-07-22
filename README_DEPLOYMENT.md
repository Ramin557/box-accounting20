# راهنمای استقرار سیستم حسابداری فارسی
# Persian Accounting System Deployment Guide

## استقرار در محیط جدید (Deploying to a New Environment)

هر وقت این پروژه را در محیط جدیدی (کامپیوتر جدید، سرور جدید، یا حتی Replit جدید) اجرا می‌کنید، این مراحل را دنبال کنید:

### مرحله 1: نصب پکیج‌ها (Install Dependencies)
```bash
pip install -r requirements.txt
# یا در صورت استفاده از uv:
# uv sync
```

### مرحله 2: تنظیم دیتابیس (Database Configuration)
دو راه برای تنظیم دیتابیس دارید:

#### راه اول: استفاده از Secrets در Replit
1. در پنل سمت چپ Replit، روی **Tools** کلیک کنید
2. **Secrets** را انتخاب کنید
3. یک Secret جدید اضافه کنید:
   - **Key:** `DATABASE_URL`
   - **Value:** آدرس دیتابیس PostgreSQL شما

#### راه دوم: استفاده از فایل .env (محلی)
فایل `.env` ایجاد کنید و این خط را اضافه کنید:
```env
DATABASE_URL=postgresql://username:password@host:port/dbname
```

### مرحله 3: اجرای اسکریپت استقرار (Run Deployment Script)
```bash
python deploy.py
```

این اسکریپت خودکار انجام می‌دهد:
- ✅ ایجاد جداول دیتابیس
- ✅ راه‌اندازی سیستم دسترسی‌ها (RBAC)
- ✅ ایجاد کاربر مدیر (admin)
- ✅ بررسی صحت پیکربندی

### مرحله 4: اجرای اپلیکیشن (Run Application)
```bash
python main.py
```

اپلیکیشن در آدرس `http://localhost:5000` (یا پورتی که Replit تعیین می‌کند) در دسترس خواهد بود.

### اطلاعات ورود پیش‌فرض (Default Login)
- **نام کاربری:** `admin`
- **رمز عبور:** `admin123`
- **نقش:** مدیر ارشد (دسترسی کامل به همه بخش‌ها)

### 🔧 تضمین دسترسی کامل Admin
اگر پس از جابجایی فایل‌ها admin دسترسی کامل نداشت:

#### روش 1: اجرای مجدد deploy.py
```bash
python deploy.py
```

#### روش 2: اسکریپت تصحیح سریع
```bash
python fix_admin_permissions.py
```

#### روش 3: تصحیح دستی SQL
```bash
python -c "
from app import app, db
from models import User, Role
with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    super_admin = Role.query.filter_by(name='super_admin').first()
    if admin and super_admin:
        admin.role_id = super_admin.id
        db.session.commit()
        print('✅ admin دسترسی کامل دارد')
"
```

---

## حل مشکلات رایج (Troubleshooting)

### مشکل: "نام کاربری یا رمز عبور اشتباه است"
**علت:** کاربر admin ایجاد نشده است.
**راه حل:** اسکریپت `deploy.py` را دوباره اجرا کنید.

### مشکل: "Could not parse SQLAlchemy URL"
**علت:** `DATABASE_URL` تنظیم نشده است.
**راه حل:** 
1. `DATABASE_URL` را در Secrets یا فایل `.env` تنظیم کنید
2. اپلیکیشن را restart کنید

### مشکل: "relation does not exist"
**علت:** جداول دیتابیس ایجاد نشده‌اند.
**راه حل:** `python deploy.py` را اجرا کنید.

---

## برای توسعه‌دهندگان (For Developers)

### ساختار فایل‌های مهم:
- `deploy.py` - اسکریپت استقرار خودکار
- `app.py` - اپلیکیشن اصلی Flask
- `models.py` - مدل‌های دیتابیس
- `rbac_setup.py` - راه‌اندازی سیستم دسترسی‌ها
- `.env` - متغیرهای محیطی (محلی)

### اضافه کردن Migration در آینده:
```bash
# نصب Flask-Migrate
pip install Flask-Migrate

# راه‌اندازی Migration
flask db init

# ایجاد Migration جدید
flask db migrate -m "توضیح تغییرات"

# اعمال Migration
flask db upgrade
```

### دستورات مفید:
```bash
# ایجاد کاربر جدید
python -c "from deploy import create_admin_user; create_admin_user()"

# بازنشانی دیتابیس
python -c "from app import app, db; import models; app.app_context().push(); db.drop_all(); db.create_all()"

# بررسی وضعیت دیتابیس
python -c "from app import app, db; from models import User; app.app_context().push(); print(f'تعداد کاربران: {User.query.count()}')"
```

---

## نکات امنیتی (Security Notes)

⚠️ **مهم:** در محیط production:
1. رمز عبور admin را تغییر دهید
2. SECRET_KEY قوی تنظیم کنید
3. از HTTPS استفاده کنید
4. دسترسی‌های غیرضروری را حذف کنید

---

## پشتیبانی (Support)

در صورت بروز مشکل:
1. ابتدا `deploy.py` را دوباره اجرا کنید
2. لاگ‌های اپلیکیشن را بررسی کنید
3. اطمینان حاصل کنید که `DATABASE_URL` درست تنظیم شده است

این راهنما تضمین می‌کند که هر وقت پروژه را به محیط جدیدی منتقل کنید، تنها با چند دستور ساده، کاملاً آماده کار شود.