from app import app
from models import User

with app.app_context():
    users = User.query.all()
    print("\nUsers in database:")
    print("-" * 50)
    for user in users:
        print(f"Username: {user.username}, Email: {user.email}, Active: {user.active}")
    print("-" * 50)