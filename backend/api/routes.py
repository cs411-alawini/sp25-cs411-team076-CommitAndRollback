from flask import jsonify, request
from db.user_operations import get_all_users, get_user_by_id, get_user_recommendations, verify_login, create_user, get_friend_recommendations, get_user_details, update_user_details
from db.group_operations import get_all_groups, get_group_recommendations, get_user_groups, add_user_to_group
from db.chat_operations import send_message, get_chat_messages, get_group_messages, send_group_message

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
                "groups": "/api/groups",
                "group_recommendations": "/api/users/<user_id>/group-recommendations",
                "friend_recommendations": "/api/users/<user_id>/friend-recommendations",
                "login": "/api/login",
                "signup": "/api/signup",
                "chat_messages": "/api/users/<user_id1>/chat/<user_id2>/messages",
                "send_message": "/api/messages/send",
                "group_messages": "/api/groups/<group_id>/messages",
                "send_group_message": "/api/groups/<group_id>/messages/send",
                "user_groups": "/api/users/<user_id>/groups",
                "add_user_to_group": "/api/groups/<group_id>/add-user"
            }
        })

    @app.route('/api/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        result = create_user(data)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 201

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
                "user": user,
                "redirect_url": "/dashboard"
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

    @app.route('/api/users/<int:user_id>/friend-recommendations', methods=['GET'])
    def user_friend_recommendations(user_id):
        recommendations = get_friend_recommendations(user_id)
        if recommendations is None:
            return jsonify({"error": "Failed to fetch friend recommendations"}), 500
        return jsonify(recommendations)

    @app.route('/api/users/<int:user_id>/group-recommendations', methods=['GET'])
    def user_group_recommendations(user_id):
        recommendations = get_group_recommendations(user_id)
        if recommendations is None:
            return jsonify({"error": "Failed to fetch group recommendations"}), 500
        return jsonify(recommendations)

    @app.route('/api/users/<int:user_id>/details', methods=['GET'])
    def user_details(user_id):
        user = get_user_details(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user)

    @app.route('/api/users/<int:user_id>/details', methods=['PATCH'])
    def update_user(user_id):
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        result = update_user_details(user_id, data)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)

    @app.route('/api/users/<int:user_id>/groups', methods=['GET'])
    def user_groups(user_id):
        groups = get_user_groups(user_id)
        if groups is None:
            return jsonify({"error": "Failed to fetch user groups"}), 500
        return jsonify(groups)

    # Group Routes
    @app.route('/api/groups', methods=['GET'])
    def groups():
        groups = get_all_groups()
        if groups is None:
            return jsonify({"error": "Failed to fetch groups"}), 500
        return jsonify(groups)

    @app.route('/api/messages/send', methods=['POST'])
    def send_user_message():
        data = request.get_json()
        if not data or 'sender_id' not in data or 'receiver_id' not in data or 'message_text' not in data:
            return jsonify({"error": "sender_id, receiver_id, and message_text are required"}), 400
            
        sender_id = data['sender_id']
        receiver_id = data['receiver_id']
        message_text = data['message_text']
        
        # Validate that both users exist
        sender = get_user_by_id(sender_id)
        receiver = get_user_by_id(receiver_id)
        
        if not sender:
            return jsonify({"error": "Sender not found"}), 404
        if not receiver:
            return jsonify({"error": "Receiver not found"}), 404
            
        message = send_message(sender_id, receiver_id, message_text)
        if "error" in message:
            return jsonify(message), 400
        return jsonify(message), 201

    @app.route('/api/users/<int:user_id1>/chat/<int:user_id2>/messages', methods=['GET'])
    def get_messages(user_id1, user_id2):
        messages = get_chat_messages(user_id1, user_id2)
        if messages is None:
            return jsonify({"error": "Failed to fetch messages"}), 500
        if "error" in messages:
            return jsonify(messages), 404
        return jsonify(messages)

    @app.route('/api/groups/<int:group_id>/messages', methods=['GET'])
    def group_messages(group_id):
        messages = get_group_messages(group_id)
        if messages is None:
            return jsonify({"error": "Failed to fetch group messages"}), 500
        if "error" in messages:
            return jsonify(messages), 404
        return jsonify(messages)
        
    @app.route('/api/groups/<int:group_id>/messages/send', methods=['POST'])
    def send_group_message_route(group_id):
        data = request.get_json()
        if not data or 'user_id' not in data or 'message_text' not in data:
            return jsonify({"error": "user_id and message_text are required"}), 400
            
        user_id = data['user_id']
        message_text = data['message_text']
        
        # Validate that the user exists
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        message = send_group_message(group_id, user_id, message_text)
        if "error" in message:
            return jsonify(message), 400
        return jsonify(message), 201

    @app.route('/api/groups/<int:group_id>/add-user', methods=['POST'])
    def add_user_to_group_route(group_id):
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id is required"}), 400
            
        user_id = data['user_id']
        
        result = add_user_to_group(user_id, group_id)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 201 