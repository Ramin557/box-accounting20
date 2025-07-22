import traceback

try:
    from app import app
    from models import User

    with app.app_context():
        user = User.query.filter_by(username='admin').first()
        with open('admin_check_result.txt', 'w') as f:
            if user:
                f.write(f'Username: {user.username}\n')
                f.write(f'Email: {user.email}\n')
                f.write(f'Active: {user.is_active}\n')
                f.write(f'Password Hash: {user.password_hash}\n')
                f.write(f'Check Password: {user.check_password("admin123")}\n')
            else:
                f.write('Admin user not found!\n')
        print('Results written to admin_check_result.txt')
except Exception as e:
    with open('admin_check_error.txt', 'w') as f:
        f.write(f'Error: {str(e)}\n')
        f.write(traceback.format_exc())
    print('Error occurred. Check admin_check_error.txt for details.')