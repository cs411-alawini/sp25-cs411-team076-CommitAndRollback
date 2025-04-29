from flask import Flask
from flask_cors import CORS
from app.routes.auth import auth_bp
from app.routes.groups import groups_bp
from app.routes.users import users_bp
from app.routes.group_recommendations import group_recommendations_bp
from app.routes.active_groups import active_groups_bp
from app.models import db

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(group_recommendations_bp, url_prefix='/api')
    app.register_blueprint(active_groups_bp, url_prefix='/api')
    
    return app 