from flask_sqlalchemy import SQLAlchemy
from app import Base

db = SQLAlchemy(model_class=Base)


