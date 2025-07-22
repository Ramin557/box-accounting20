"""
RBAC Routes - Role-Based Access Control Management
"""

from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import app, db
from models import User, Role, Permission
from functools import wraps
from datetime import datetime

# Permission decorator
def permission_required(permission_name):
    """Decorator to check if current user has a specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                flash('لطفاً وارد سیستم شوید.', 'warning')
                return redirect(url_for('login'))
            
            if not current_user.has_permission(permission_name):
                flash('شما دسترسی لازم برای انجام این عمل را ندارید.', 'error')
                return redirect(url_for('dashboard'))
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# RBAC Management Routes

@app.route('/rbac/roles')
@login_required
@permission_required('manage_roles')
def rbac_roles():
    """List all roles"""
    roles = Role.query.order_by(Role.name).all()
    return render_template('rbac/roles.html', roles=roles)

@app.route('/rbac/roles/create', methods=['GET', 'POST'])
@login_required
@permission_required('manage_roles')
def rbac_create_role():
    """Create a new role"""
    if request.method == 'POST':
        role = Role(
            name=request.form.get('name'),
            display_name=request.form.get('display_name'),
            description=request.form.get('description'),
            is_system_role=False)