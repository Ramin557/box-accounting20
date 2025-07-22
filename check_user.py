from app import app, db
from models import User

with app.app_context():
    user = User.query.filter_by(username='admin').first()
    print(f'User exists: {user is not None}')
    if user:
        print(f'Username: {user.username}')
        print(f'Is active: {user.is_active}')
    else:
        print('Creating admin user...')
        admin = User(username='admin', email='admin@example.com', full_name='Admin User')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('Admin user created successfully!')