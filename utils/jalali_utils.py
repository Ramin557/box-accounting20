from datetime import datetime
import jdatetime

def gregorian_to_jalali(date_obj):
    """تبدیل تاریخ میلادی به شمسی"""
    if not date_obj:
        return None
    return jdatetime.datetime.fromgregorian(datetime=date_obj)

def jalali_to_gregorian(year, month, day):
    """تبدیل تاریخ شمسی به میلادی"""
    try:
        jdate = jdatetime.datetime(year=int(year), month=int(month), day=int(day))
        return jdate.togregorian()
    except ValueError:
        return None

def format_jalali_date(date_obj, format_str='%Y/%m/%d'):
    """فرمت کردن تاریخ شمسی"""
    if not date_obj:
        return ''
    jdate = gregorian_to_jalali(date_obj)
    return jdate.strftime(format_str)

def parse_jalali_date(date_str):
    """تبدیل رشته تاریخ شمسی به آبجکت تاریخ میلادی"""
    if not date_str or date_str.strip() == '':
        return None
    
    try:
        # فرمت ورودی: 1402/01/01
        parts = date_str.split('/')
        if len(parts) != 3:
            return None
        
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        return jalali_to_gregorian(year, month, day)
    except (ValueError, IndexError):
        return None

def get_current_jalali_date():
    """دریافت تاریخ شمسی امروز"""
    return jdatetime.datetime.now()

def get_current_jalali_date_str(format_str='%Y/%m/%d'):
    """دریافت رشته تاریخ شمسی امروز"""
    return get_current_jalali_date().strftime(format_str)