from flask import jsonify, request
from db.user_operations import get_all_users, get_user_by_id, get_user_recommendations, verify_login
from db.group_operations import get_all_groups

def setup_routes(app):
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            "message": "Welcome to Synapo API",
            "endpoints": {
                "users": "/api/users",
                "user": "/api/users/<user_id>",
                "user_recommendations": "/api/users/<user_id>/recommendations",
                "groups": "/api/groups"
            }
        })

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Username and password are required"}), 400
            
        username = data['username']
        password = data['password']
        
        user = verify_login(username, password)
        if user:
            # Remove sensitive information before sending response
            user.pop('password', None)
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": user
            })
        else:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

    # User Routes
    @app.route('/api/users', methods=['GET'])
    def users():
        users = get_all_users()
        if users is None:
            return jsonify({"error": "Failed to fetch users"}), 500
        return jsonify(users)

    @app.route('/api/users/<int:user_id>', methods=['GET'])
    def user(user_id):
        user = get_user_by_id(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user)

    @app.route('/api/users/<int:user_id>/recommendations', methods=['GET'])
    def user_recommendations(user_id):
        recommendations = get_user_recommendations(user_id)
        if recommendations is None:
            return jsonify({"error": "Failed to fetch recommendations"}), 500
        return jsonify(recommendations)

    # Group Routes
    @app.route('/api/groups', methods=['GET'])
    def groups():
        groups = get_all_groups()
        if groups is None:
            return jsonify({"error": "Failed to fetch groups"}), 500
        return jsonify(groups) 