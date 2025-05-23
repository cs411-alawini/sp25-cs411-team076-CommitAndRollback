from flask import jsonify, request
from db.user_operations import (
    get_all_users, get_user_by_id, get_user_recommendations, verify_login, 
    create_user, get_friend_recommendations, get_user_details, update_user_details, 
    get_user_friends, create_friendship, create_friend_request, 
    get_pending_friend_requests, update_friend_request, get_sent_friend_requests,
    search_users, get_all_interests, delete_user_account, get_recommended_groups,
    get_active_groups
)
from db.group_operations import (
    get_all_groups, get_group_recommendations, get_user_groups, add_user_to_group,
    get_group_members, get_group_events, remove_user_from_group, search_groups
)
from db.chat_operations import send_message, get_chat_messages, get_group_messages, send_group_message
from db.connection import get_connection
from .advanced_queries import advanced_queries_bp
import mysql.connector

def setup_routes(app):
    # Register the advanced queries blueprint
    app.register_blueprint(advanced_queries_bp, url_prefix='/api')

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
                "group_search": "/api/groups/search",
                "recommended_groups": "/api/users/<user_id>/recommended-groups",
                "active_groups": "/api/active-groups",
                "friend_recommendations": "/api/users/<user_id>/friend-recommendations",
                "login": "/api/login",
                "signup": "/api/signup",
                "chat_messages": "/api/users/<user_id1>/chat/<user_id2>/messages",
                "send_message": "/api/messages/send",
                "group_messages": "/api/groups/<group_id>/messages",
                "send_group_message": "/api/groups/<group_id>/messages/send",
                "user_groups": "/api/users/<user_id>/groups",
                "add_user_to_group": "/api/groups/<group_id>/add-user",
                "user_friends": "/api/users/<user_id>/friends",
                "create_friendship": "/api/users/<user_id1>/friends/<user_id2>",
                "friend_requests": "/api/users/<user_id>/friend-requests",
                "send_friend_request": "/api/users/<user_id1>/friend-requests/<user_id2>",
                "update_friend_request": "/api/friend-requests/<sender_id>/<receiver_id>/update",
                "group_members": "/api/groups/<group_id>/members",
                "group_events": "/api/groups/<group_id>/events",
                "remove_user_from_group": "/api/groups/<group_id>/remove-user",
                "user_search": "/api/users/search",
                "interests": "/api/interests"
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

    @app.route('/api/users/<int:user_id>/friends', methods=['GET'])
    def user_friends(user_id):
        friends = get_user_friends(user_id)
        if friends is None:
            return jsonify({"error": "Failed to fetch user friends"}), 500
        return jsonify(friends)

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
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id is required"}), 400
            
        user_id = data['user_id']
        message_text = data.get('message_text', '')  # Default to empty string if not provided
        
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

    @app.route('/api/users/<int:user_id1>/friends/<int:user_id2>', methods=['POST'])
    def create_user_friendship(user_id1, user_id2):
        """Create a friendship between two users"""
        result = create_friendship(user_id1, user_id2)
        if result is None:
            return jsonify({"error": "Failed to create friendship"}), 500
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 201

    @app.route('/api/users/<int:user_id1>/friend-requests/<int:user_id2>', methods=['POST'])
    def send_friend_request(user_id1, user_id2):
        """Send a friend request from user_id1 to user_id2"""
        result = create_friend_request(user_id1, user_id2)
        if result is None:
            return jsonify({"error": "Failed to create friend request"}), 500
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 201

    @app.route('/api/users/<int:user_id>/friend-requests', methods=['GET'])
    def get_user_friend_requests(user_id):
        """Get all pending friend requests for a user"""
        requests = get_pending_friend_requests(user_id)
        if requests is None:
            return jsonify({"error": "Failed to fetch friend requests"}), 500
        return jsonify(requests)

    @app.route('/api/users/<int:user_id>/sent-friend-requests', methods=['GET'])
    def get_user_sent_friend_requests(user_id):
        """Get all friend requests sent by a user"""
        requests = get_sent_friend_requests(user_id)
        if requests is None:
            return jsonify({"error": "Failed to fetch sent friend requests"}), 500
        return jsonify(requests)

    @app.route('/api/friend-requests/<int:sender_id>/<int:receiver_id>/update', methods=['POST'])
    def update_friend_request_status(sender_id, receiver_id):
        """Update a friend request's status (accept/reject)"""
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "status is required"}), 400
            
        status = data['status']
        
        if status not in ['Accepted', 'Rejected']:
            return jsonify({"error": "Status must be either 'Accepted' or 'Rejected'"}), 400
            
        result = update_friend_request(sender_id, receiver_id, status)
        if result is None:
            return jsonify({"error": "Failed to update friend request"}), 500
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)

    @app.route('/api/groups/<int:group_id>/members', methods=['GET'])
    def get_group_members_route(group_id):
        """Get all members of a group"""
        members = get_group_members(group_id)
        if members is None:
            return jsonify({"error": "Failed to fetch group members"}), 500
        if "error" in members:
            return jsonify(members), 404
        return jsonify(members)

    @app.route('/api/groups/<int:group_id>/events', methods=['GET'])
    def get_group_events_route(group_id):
        """Get all events of a group"""
        events = get_group_events(group_id)
        if events is None:
            return jsonify({"error": "Failed to fetch group events"}), 500
        if "error" in events:
            return jsonify(events), 404
        return jsonify(events)
    
    @app.route('/api/groups/<int:group_id>/remove-user', methods=['POST'])
    def remove_user_from_group_route(group_id):
        """Remove a user from a group"""
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id is required"}), 400
            
        user_id = data['user_id']
        
        result = remove_user_from_group(group_id, user_id)
        
        if result is None:
            return jsonify({"error": "Failed to remove user from group"}), 500
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 200
        
    @app.route('/api/users/search', methods=['GET'])
    def search_users_route():
        """Search for users by name"""
        search_term = request.args.get('q', '')
        user_id = request.args.get('user_id')
        
        # Convert user_id to integer if provided
        current_user_id = None
        if user_id:
            try:
                current_user_id = int(user_id)
            except ValueError:
                return jsonify({"error": "User ID must be an integer"}), 400
        
        results = search_users(search_term, None, current_user_id)
        if results is None:
            return jsonify({"error": "Failed to search users"}), 500
        return jsonify(results)
        
    @app.route('/api/groups/search', methods=['GET'])
    def search_groups_route():
        """Search for groups by name"""
        search_term = request.args.get('q', '')
        user_id = request.args.get('user_id')
        
        # Convert user_id to integer if provided
        current_user_id = None
        if user_id:
            try:
                current_user_id = int(user_id)
            except ValueError:
                return jsonify({"error": "User ID must be an integer"}), 400
        
        results = search_groups(search_term, None, current_user_id)
        if results is None:
            return jsonify({"error": "Failed to search groups"}), 500
        return jsonify(results)
        
    @app.route('/api/interests', methods=['GET'])
    def get_interests_route():
        """Get all available interests"""
        interests = get_all_interests()
        if interests is None:
            return jsonify({"error": "Failed to fetch interests"}), 500
        return jsonify(interests)
        
    @app.route('/api/users/<int:user_id>/interests', methods=['POST'])
    def add_user_interests(user_id):
        """Add interests for a user"""
        data = request.get_json()
        if not data or 'interests' not in data:
            return jsonify({"error": "interests array is required"}), 400
            
        interests = data['interests']
        
        # Validate that the user exists
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        connection = None
        cursor = None
        try:
            connection = get_connection()
            if not connection:
                return jsonify({"error": "Database connection failed"}), 500
                
            cursor = connection.cursor()
            
            # First delete existing user interests
            cursor.execute("DELETE FROM User_Interests WHERE user_id = %s", (user_id,))
            
            # Insert new user interests
            if interests and len(interests) > 0:
                insert_values = [(user_id, interest_id) for interest_id in interests]
                cursor.executemany(
                    "INSERT INTO User_Interests (user_id, interest_id) VALUES (%s, %s)",
                    insert_values
                )
                
            connection.commit()
            return jsonify({
                "success": True,
                "message": "User interests updated successfully"
            })
            
        except Exception as e:
            if connection:
                connection.rollback()
            print(f"Error adding user interests: {str(e)}")
            return jsonify({"error": str(e)}), 500
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    # patch endpoint for updating user interests
    @app.route('/api/users/<int:user_id>/interests', methods=['PATCH'])
    def update_user_interests(user_id):
        """Update interests for a user"""
        data = request.get_json()
        if not data or 'interests' not in data:
            return jsonify({"error": "interests array is required"}), 400
            
        interests = data['interests']
        
        # Validate that the user exists
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        connection = None
        cursor = None
        try:
            connection = get_connection()
            if not connection:
                return jsonify({"error": "Database connection failed"}), 500
                
            cursor = connection.cursor()
            
            # First delete existing user interests
            cursor.execute("DELETE FROM User_Interests WHERE user_id = %s", (user_id,))
            
            # Insert new user interests
            if interests and len(interests) > 0:
                insert_values = [(user_id, interest_id) for interest_id in interests]
                cursor.executemany(
                    "INSERT INTO User_Interests (user_id, interest_id) VALUES (%s, %s)",
                    insert_values
                )
                
            connection.commit()
            return jsonify({
                "success": True,
                "message": "User interests updated successfully"
            })
            
        except Exception as e:
            if connection:
                connection.rollback()
            print(f"Error updating user interests: {str(e)}")
            return jsonify({"error": str(e)}), 500
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    # Add the delete user account endpoint
    @app.route('/api/users/<int:user_id>', methods=['DELETE'])
    def delete_user(user_id):
        """Delete a user account and all associated data"""
        result = delete_user_account(user_id)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result), 200

    @app.route('/api/users/<int:user_id>/recommended-groups', methods=['GET'])
    def user_recommended_groups(user_id):
        groups = get_recommended_groups(user_id)
        if groups is None:
            return jsonify({"error": "Failed to fetch recommended groups"}), 500
        return jsonify(groups)

    @app.route('/api/active-groups', methods=['GET'])
    def active_groups():
        groups = get_active_groups()
        if groups is None:
            return jsonify({"error": "Failed to fetch active groups"}), 500
        return jsonify(groups)

    # Remove the old active-groups route since it's now under users
    # @app.route('/api/active-groups', methods=['GET'])
    # def active_groups():
    #     groups = get_active_groups()
    #     if groups is None:
    #         return jsonify({"error": "Failed to fetch active groups"}), 500
    #     return jsonify(groups)

    # Remove the duplicate routes for recommended-groups and active-groups
    # since they are now handled by the advanced_queries blueprint 
