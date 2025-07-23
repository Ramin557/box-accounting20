from app import db
from flask_login import UserMixin
from datetime import datetime
import jdatetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Numeric

# RBAC Models
class Permission(db.Model):
    __tablename__ = 'permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(32))  # customers, products, orders, invoices, reports, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    display_name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    is_system_role = db.Column(db.Boolean, default=False)  # Cannot be deleted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='user_role', lazy=True)
    permissions = db.relationship('Permission', secondary='role_permissions', backref='roles')

# Association table for many-to-many relationship between roles and permissions
role_permissions = db.Table('role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(128), nullable=False)
    password_hash = db.Column(db.String(256))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=True)
    
    # Keep legacy role field for backward compatibility
    role = db.Column(db.String(32), default='accountant')  # admin, accountant
    
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_jalali_created_date(self):
        if self.created_at:
            return jdatetime.datetime.fromgregorian(datetime=self.created_at).strftime('%Y/%m/%d')
        return 'نامشخص'
    
    def get_jalali_last_login(self):
        if self.last_login:
            return jdatetime.datetime.fromgregorian(datetime=self.last_login).strftime('%Y/%m/%d %H:%M')
        return 'هرگز وارد نشده'
    
    # Legacy role methods for backward compatibility
    def is_admin(self):
        return self.role == 'admin' or (self.user_role and self.user_role.name == 'admin')
    
    def is_accountant(self):
        return self.role == 'accountant' or (self.user_role and self.user_role.name == 'accountant')
    
    # New permission-based methods
    def has_permission(self, permission_name):
        """Check if user has a specific permission"""
        if not self.user_role:
            # Fallback to legacy role system
            if self.is_admin():
                return True  # Admin has all permissions
            return False
        
        # Check if user's role has the permission
        for permission in self.user_role.permissions:
            if permission.name == permission_name:
                return True
        return False
    
    def has_any_permission(self, permission_names):
        """Check if user has any of the specified permissions"""
        if not isinstance(permission_names, list):
            permission_names = [permission_names]
        
        for permission_name in permission_names:
            if self.has_permission(permission_name):
                return True
        return False
    
    def get_permissions(self):
        """Get list of all permissions for this user"""
        if not self.user_role:
            return []
        return [p.name for p in self.user_role.permissions]
    
    def get_role_display_name(self):
        """Get display name of user's role"""
        if self.user_role:
            return self.user_role.display_name
        # Fallback to legacy role
        if self.role == 'admin':
            return 'مدیر سیستم'
        elif self.role == 'accountant':
            return 'حسابدار'
        return 'نامشخص'

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    company_name = db.Column(db.String(128))
    phone = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    national_id = db.Column(db.String(20))
    tax_id = db.Column(db.String(20))
    credit_limit = db.Column(Numeric(15, 2), default=0)
    balance = db.Column(Numeric(15, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True)
    invoices = db.relationship('Invoice', backref='customer', lazy=True)

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    company_name = db.Column(db.String(128))
    phone = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    tax_id = db.Column(db.String(20))
    account_number = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship('Purchase', backref='supplier', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    unit = db.Column(db.String(20), default='عدد')  # واحد اندازه‌گیری
    category = db.Column(db.String(64))
    
    # Box specifications
    length = db.Column(Numeric(10, 2))  # طول
    width = db.Column(Numeric(10, 2))   # عرض
    height = db.Column(Numeric(10, 2))  # ارتفاع
    material_type = db.Column(db.String(64))  # نوع مواد
    
    # Pricing
    cost_price = db.Column(Numeric(15, 2), default=0)
    selling_price = db.Column(Numeric(15, 2), default=0)
    cost = db.Column(Numeric(15, 2), default=0)

    def calculate_cost(self):
        total_cost = 0
        for bom_item in self.raw_materials:
            total_cost += bom_item.raw_material.cost_price * bom_item.quantity
        self.cost = total_cost
    
    # Inventory
    current_stock = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=0)
    max_stock_level = db.Column(db.Integer, default=1000)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    invoice_items = db.relationship('InvoiceItem', backref='product', lazy=True)
    stock_movements = db.relationship('StockMovement', backref='product', lazy=True)
    raw_materials = db.relationship('RawMaterial', secondary='product_raw_materials', backref=db.backref('products', lazy='dynamic'))

class RawMaterial(db.Model):
    __tablename__ = 'raw_materials'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    unit = db.Column(db.String(20), default='کیلوگرم')
    cost_price = db.Column(Numeric(15, 2), default=0)
    current_stock = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=0)
    max_stock_level = db.Column(db.Integer, default=1000)

product_raw_materials = db.Table('product_raw_materials',
    db.Column('product_id', db.Integer, db.ForeignKey('products.id')),
    db.Column('raw_material_id', db.Integer, db.ForeignKey('raw_materials.id')),
    db.Column('quantity', db.Integer, nullable=False)
)

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_date = db.Column(db.DateTime)
    status = db.Column(db.String(32), default='pending')  # pending, confirmed, producing, completed, cancelled
    
    # Financial
    subtotal = db.Column(Numeric(15, 2), default=0)
    tax_amount = db.Column(Numeric(15, 2), default=0)
    discount_amount = db.Column(Numeric(15, 2), default=0)
    total_amount = db.Column(Numeric(15, 2), default=0)
    
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def get_jalali_order_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.order_date).strftime('%Y/%m/%d')
        
    def get_jalali_delivery_date(self):
        if self.delivery_date:
            return jdatetime.datetime.fromgregorian(datetime=self.delivery_date).strftime('%Y/%m/%d')
        return ''

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(Numeric(15, 2), nullable=False)
    discount_percent = db.Column(Numeric(5, 2), default=0)
    line_total = db.Column(Numeric(15, 2), nullable=False)

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(32), default='draft')  # draft, sent, paid, overdue, cancelled
    
    # Financial
    subtotal = db.Column(Numeric(15, 2), default=0)
    tax_amount = db.Column(Numeric(15, 2), default=0)
    discount_amount = db.Column(Numeric(15, 2), default=0)
    total_amount = db.Column(Numeric(15, 2), default=0)
    paid_amount = db.Column(Numeric(15, 2), default=0)
    
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy=True)
    
    def get_jalali_invoice_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.invoice_date).strftime('%Y/%m/%d')
        
    def get_jalali_due_date(self):
        if self.due_date:
            return jdatetime.datetime.fromgregorian(datetime=self.due_date).strftime('%Y/%m/%d')
        return ''

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(Numeric(15, 2), nullable=False)
    discount_percent = db.Column(Numeric(5, 2), default=0)
    line_total = db.Column(Numeric(15, 2), nullable=False)

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    payment_number = db.Column(db.String(50), unique=True, nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    amount = db.Column(Numeric(15, 2), nullable=False)
    payment_method = db.Column(db.String(32))  # cash, check, transfer, card
    reference_number = db.Column(db.String(100))
    status = db.Column(db.String(32), default='confirmed')  # pending, confirmed, cancelled
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_jalali_payment_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.payment_date).strftime('%Y/%m/%d')

class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_number = db.Column(db.String(50), unique=True, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    delivery_date = db.Column(db.DateTime)
    status = db.Column(db.String(32), default='pending')  # pending, ordered, received, cancelled
    
    # Financial
    subtotal = db.Column(Numeric(15, 2), default=0)
    tax_amount = db.Column(Numeric(15, 2), default=0)
    total_amount = db.Column(Numeric(15, 2), default=0)
    paid_amount = db.Column(Numeric(15, 2), default=0)
    
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_jalali_purchase_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.purchase_date).strftime('%Y/%m/%d')

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.String(32), nullable=False)  # in, out, adjustment
    quantity = db.Column(db.Integer, nullable=False)
    reference_type = db.Column(db.String(32))  # order, invoice, purchase, adjustment
    reference_id = db.Column(db.Integer)
    notes = db.Column(db.Text)
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_jalali_movement_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.movement_date).strftime('%Y/%m/%d')

class FinancialAccount(db.Model):
    __tablename__ = 'financial_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    account_code = db.Column(db.String(20), unique=True, nullable=False)
    account_name = db.Column(db.String(128), nullable=False)
    account_type = db.Column(db.String(32), nullable=False)  # asset, liability, equity, revenue, expense
    parent_id = db.Column(db.Integer, db.ForeignKey('financial_accounts.id'))
    balance = db.Column(Numeric(15, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for account hierarchy
    children = db.relationship('FinancialAccount', backref=db.backref('parent', remote_side=[id]))

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    entry_number = db.Column(db.String(50), unique=True, nullable=False)
    entry_date = db.Column(db.DateTime, default=datetime.utcnow)
    reference_type = db.Column(db.String(32))  # invoice, payment, purchase, adjustment
    reference_id = db.Column(db.Integer)
    description = db.Column(db.Text, nullable=False)
    total_debit = db.Column(Numeric(15, 2), default=0)
    total_credit = db.Column(Numeric(15, 2), default=0)
    status = db.Column(db.String(32), default='draft')  # draft, posted, reversed
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='journal_entry', lazy=True, cascade='all, delete-orphan')
    
    def get_jalali_entry_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.entry_date).strftime('%Y/%m/%d')

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    journal_entry_id = db.Column(db.Integer, db.ForeignKey('journal_entries.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('financial_accounts.id'), nullable=False)
    debit_amount = db.Column(Numeric(15, 2), default=0)
    credit_amount = db.Column(Numeric(15, 2), default=0)
    description = db.Column(db.Text)
    
    # Relationships
    account = db.relationship('FinancialAccount', backref='transactions')

# Budget Management Models
class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    budget_name = db.Column(db.String(128), nullable=False)
    budget_year = db.Column(db.Integer, nullable=False)  # Persian year
    budget_period = db.Column(db.String(32), default='annual')  # monthly, quarterly, annual
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    total_budgeted = db.Column(Numeric(15, 2), default=0)
    total_actual = db.Column(Numeric(15, 2), default=0)
    status = db.Column(db.String(32), default='draft')  # draft, approved, active, closed
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('BudgetItem', backref='budget', lazy=True, cascade='all, delete-orphan')
    
    def get_jalali_start_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.start_date).strftime('%Y/%m/%d')
        
    def get_jalali_end_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.end_date).strftime('%Y/%m/%d')
    
    def get_variance(self):
        return self.total_actual - self.total_budgeted
    
    def get_variance_percentage(self):
        if self.total_budgeted > 0:
            return (self.get_variance() / self.total_budgeted) * 100
        return 0

class BudgetItem(db.Model):
    __tablename__ = 'budget_items'
    
    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('budgets.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('financial_accounts.id'), nullable=False)
    category = db.Column(db.String(64), nullable=False)  # درآمد, هزینه, سرمایه‌گذاری
    item_name = db.Column(db.String(128), nullable=False)
    budgeted_amount = db.Column(Numeric(15, 2), nullable=False)
    actual_amount = db.Column(Numeric(15, 2), default=0)
    month_1 = db.Column(Numeric(15, 2), default=0)
    month_2 = db.Column(Numeric(15, 2), default=0)
    month_3 = db.Column(Numeric(15, 2), default=0)
    month_4 = db.Column(Numeric(15, 2), default=0)
    month_5 = db.Column(Numeric(15, 2), default=0)
    month_6 = db.Column(Numeric(15, 2), default=0)
    month_7 = db.Column(Numeric(15, 2), default=0)
    month_8 = db.Column(Numeric(15, 2), default=0)
    month_9 = db.Column(Numeric(15, 2), default=0)
    month_10 = db.Column(Numeric(15, 2), default=0)
    month_11 = db.Column(Numeric(15, 2), default=0)
    month_12 = db.Column(Numeric(15, 2), default=0)
    notes = db.Column(db.Text)
    
    # Relationships
    account = db.relationship('FinancialAccount', backref='budget_items')
    
    def get_variance(self):
        return self.actual_amount - self.budgeted_amount
    
    def get_variance_percentage(self):
        if self.budgeted_amount > 0:
            return (self.get_variance() / self.budgeted_amount) * 100
        return 0

# Bank Account Models
class BankAccount(db.Model):
    __tablename__ = 'bank_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    account_name = db.Column(db.String(128), nullable=False)
    bank_name = db.Column(db.String(128), nullable=False)
    account_number = db.Column(db.String(50), unique=True, nullable=False)
    iban = db.Column(db.String(26), unique=True)
    swift_code = db.Column(db.String(11))
    account_type = db.Column(db.String(32), default='checking')  # checking, savings, business
    currency = db.Column(db.String(10), default='IRR')
    balance = db.Column(Numeric(15, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    is_primary = db.Column(db.Boolean, default=False)
    branch_name = db.Column(db.String(128))
    branch_code = db.Column(db.String(20))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('BankTransaction', backref='bank_account', lazy=True)
    checks = db.relationship('Check', backref='bank_account', lazy=True)

class BankTransaction(db.Model):
    __tablename__ = 'bank_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    bank_account_id = db.Column(db.Integer, db.ForeignKey('bank_accounts.id'), nullable=False)
    transaction_date = db.Column(db.DateTime, nullable=False)
    transaction_type = db.Column(db.String(32), nullable=False)  # deposit, withdrawal, transfer
    amount = db.Column(Numeric(15, 2), nullable=False)
    description = db.Column(db.String(255))
    reference_number = db.Column(db.String(100))
    related_party = db.Column(db.String(128))  # پایان گیرنده یا پرداخت کننده
    category = db.Column(db.String(64))
    reconciled = db.Column(db.Boolean, default=False)
    reconciled_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_jalali_transaction_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.transaction_date).strftime('%Y/%m/%d')

# Check Management Models
class Check(db.Model):
    __tablename__ = 'checks'
    
    id = db.Column(db.Integer, primary_key=True)
    check_number = db.Column(db.String(50), unique=True, nullable=False)
    bank_account_id = db.Column(db.Integer, db.ForeignKey('bank_accounts.id'), nullable=False)
    check_type = db.Column(db.String(32), nullable=False)  # issued, received
    payee_payor = db.Column(db.String(128), nullable=False)  # گیرنده یا پرداخت کننده
    amount = db.Column(Numeric(15, 2), nullable=False)
    issue_date = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(32), default='issued')  # issued, deposited, cleared, bounced, cancelled
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    description = db.Column(db.Text)
    cleared_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_jalali_issue_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.issue_date).strftime('%Y/%m/%d')
        
    def get_jalali_due_date(self):
        return jdatetime.datetime.fromgregorian(datetime=self.due_date).strftime('%Y/%m/%d')
        
    def get_jalali_cleared_date(self):
        if self.cleared_date:
            return jdatetime.datetime.fromgregorian(datetime=self.cleared_date).strftime('%Y/%m/%d')
        return ''