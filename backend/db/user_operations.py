from .connection import get_connection
from pymysql.cursors import DictCursor
from datetime import datetime

def get_all_users():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("SELECT user_id, full_name, gender, age, location, bio FROM User LIMIT 10")
        users = cursor.fetchall()
        return users
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_user_by_id(user_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("SELECT user_id, full_name, gender, age, location, bio FROM User WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            # Get user interests
            cursor.execute("""
                SELECT i.interest_name 
                FROM User_Interests ui 
                JOIN Interests i ON ui.interest_id = i.interest_id 
                WHERE ui.user_id = %s
            """, (user_id,))
            interests = [row['interest_name'] for row in cursor.fetchall()]
            user['interests'] = interests
        return user
    except Exception as e:
        print(f"Error in get_user_by_id: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_user_recommendations(user_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT
                ui2.user_id AS recommended_user_id,
                u2.full_name AS recommended_user_name,
                COUNT(ui1.interest_id) AS common_interests,
                ABS(u1.age - u2.age) AS age_difference
            FROM
                User_Interests ui1
                JOIN User_Interests ui2 ON ui1.interest_id = ui2.interest_id
                AND ui1.user_id <> ui2.user_id
                JOIN User u1 ON ui1.user_id = u1.user_id
                JOIN User u2 ON ui2.user_id = u2.user_id
                LEFT JOIN Friendships f ON (
                    f.user1_id = ui1.user_id
                    AND f.user2_id = ui2.user_id
                )
                OR (
                    f.user2_id = ui1.user_id
                    AND f.user1_id = ui2.user_id
                )
            WHERE
                ui1.user_id = %s
                AND f.user1_id IS NULL
            GROUP BY
                ui2.user_id,
                u2.full_name,
                u1.age,
                u2.age
            ORDER BY
                common_interests DESC,
                age_difference ASC
            LIMIT 15
        """, (user_id,))
        recommendations = cursor.fetchall()
        return recommendations
    except Exception as e:
        print(f"Error in get_user_recommendations: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def verify_login(username, password):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT user_id, full_name, gender, age, location, bio 
            FROM User 
            WHERE full_name = %s AND password = %s
        """, (username, password))
        user = cursor.fetchone()
        return user
    except Exception as e:
        print(f"Error in verify_login: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def create_user(user_data):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Validate required fields
        if not user_data.get('full_name') or not user_data.get('password'):
            return {"error": "full_name and password are required"}
            
        # Get the latest user_id and increment by 1
        cursor.execute("SELECT MAX(user_id) as max_id FROM User")
        result = cursor.fetchone()
        next_user_id = (result['max_id'] or 0) + 1
            
        # Set created_at to current timestamp if not provided
        if 'created_at' not in user_data:
            user_data['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
        cursor.execute("""
            INSERT INTO User (
                user_id, password, full_name, gender, age, location, bio, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (
            next_user_id,
            user_data['password'],
            user_data['full_name'],
            user_data.get('gender'),
            user_data.get('age'),
            user_data.get('location'),
            user_data.get('bio'),
            user_data['created_at']
        ))
        
        connection.commit()
        return {
            "success": True, 
            "message": "User created successfully",
            "user_id": next_user_id
        }
        
    except Exception as e:
        print(f"Error in create_user: {str(e)}")
        if connection:
            connection.rollback()
        return {"error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_friend_recommendations(user_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT
                ui2.user_id AS recommended_user_id,
                u2.full_name AS recommended_user_name,
                COUNT(ui1.interest_id) AS common_interests,
                ABS(u1.age - u2.age) AS age_difference
            FROM
                User_Interests ui1
                JOIN User_Interests ui2 ON ui1.interest_id = ui2.interest_id
                AND ui1.user_id <> ui2.user_id
                JOIN User u1 ON ui1.user_id = u1.user_id
                JOIN User u2 ON ui2.user_id = u2.user_id
                LEFT JOIN Friendships f ON (
                    f.user1_id = ui1.user_id
                    AND f.user2_id = ui2.user_id
                )
                OR (
                    f.user2_id = ui1.user_id
                    AND f.user1_id = ui2.user_id
                )
            WHERE
                ui1.user_id = %s
                AND f.user1_id IS NULL
            GROUP BY
                ui2.user_id,
                u2.full_name,
                u1.age,
                u2.age
            ORDER BY
                common_interests DESC,
                age_difference ASC
            LIMIT
                15
        """, (user_id,))
        recommendations = cursor.fetchall()
        return recommendations
    except Exception as e:
        print(f"Error in get_friend_recommendations: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_user_details(user_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT user_id, password, full_name, gender, age, location, bio, created_at 
            FROM User 
            WHERE user_id = %s
        """, (user_id,))
        user = cursor.fetchone()
        if user and user['created_at']:
            # Convert the datetime to string in YYYY-MM-DD HH:MM:SS format
            user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return user
    except Exception as e:
        print(f"Error in get_user_details: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def update_user_details(user_id, user_data):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        cursor.execute("""
            UPDATE User 
            SET password = %s,
                full_name = %s,
                gender = %s,
                age = %s,
                location = %s,
                bio = %s,
                created_at = %s
            WHERE user_id = %s
        """, (
            user_data['password'],
            user_data['full_name'],
            user_data['gender'],
            user_data['age'],
            user_data['location'],
            user_data['bio'],
            user_data['created_at'],
            user_id
        ))
        
        connection.commit()
        
        # Get updated user details
        updated_user = get_user_details(user_id)
        return updated_user
        
    except Exception as e:
        print(f"Error in update_user_details: {str(e)}")
        if connection:
            connection.rollback()
        return {"error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_user_friends(user_id):
    """
    Get all friends of a user.
    
    Args:
        user_id (int): The ID of the user
        
    Returns:
        list: A list of dictionaries containing all friends of the user
    """
    connection = None
    cursor = None
    try:
        print(f"Getting friends for user_id: {user_id}")
        connection = get_connection()
        if not connection:
            print("Failed to get database connection")
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Get all friends of the user
        query = """
            SELECT 
                u.user_id,
                u.full_name,
                u.bio,
                u.location,
                u.created_at,
                f.chat_id,
                CASE 
                    WHEN f.user1_id = %s THEN f.user2_id
                    ELSE f.user1_id
                END as friend_id
            FROM 
                User u
            JOIN 
                Friendships f ON (f.user1_id = %s AND f.user2_id = u.user_id) 
                OR (f.user2_id = %s AND f.user1_id = u.user_id)
            ORDER BY 
                u.full_name
        """
        print(f"Executing query: {query}")
        print(f"With parameters: {(user_id, user_id, user_id)}")
        
        cursor.execute(query, (user_id, user_id, user_id))
        friends = cursor.fetchall()
        print(f"Found {len(friends) if friends else 0} friends")
        
        if friends:
            print("First friend data:", friends[0])
        
        # Format the created_at timestamps
        for friend in friends:
            if friend['created_at']:
                friend['created_at'] = friend['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return friends
    except Exception as e:
        print(f"Error in get_user_friends: {str(e)}")
        print(f"Error type: {type(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def create_friendship(user_id1, user_id2):
    """
    Create a friendship between two users.
    
    Args:
        user_id1 (int): The ID of the first user
        user_id2 (int): The ID of the second user
        
    Returns:
        dict: A dictionary containing the friendship details if successful, None if failed
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if Chat table exists
        cursor.execute("SHOW TABLES LIKE 'Chat'")
        if not cursor.fetchone():
            return {"error": "Chat table does not exist"}
            
        # Check if users exist
        cursor.execute("SELECT user_id, full_name FROM User WHERE user_id IN (%s, %s)", (user_id1, user_id2))
        users = cursor.fetchall()
        if len(users) != 2:
            return {"error": "One or both users do not exist"}
            
        # Get user names for chat name
        user_names = {user['user_id']: user['full_name'] for user in users}
        chat_name = f"Chat between {user_names[user_id1]} and {user_names[user_id2]}"
            
        # Check if friendship already exists
        cursor.execute("""
            SELECT * FROM Friendships 
            WHERE (user1_id = %s AND user2_id = %s) 
            OR (user1_id = %s AND user2_id = %s)
        """, (user_id1, user_id2, user_id2, user_id1))
        if cursor.fetchone():
            return {"error": "Friendship already exists"}
            
        # Get the latest chat_id and increment by 1
        cursor.execute("SELECT MAX(chat_id) as max_chat_id FROM Chat")
        result = cursor.fetchone()
        next_chat_id = (result['max_chat_id'] or 0) + 1
            
        # Create a new chat for the friendship
        cursor.execute("""
            INSERT INTO Chat (chat_id, chat_name) 
            VALUES (%s, %s)
        """, (next_chat_id, chat_name))
        
        # Create the friendship
        cursor.execute("""
            INSERT INTO Friendships (user1_id, user2_id, chat_id) 
            VALUES (%s, %s, %s)
        """, (user_id1, user_id2, next_chat_id))
        
        connection.commit()
        
        # Get the created friendship details
        cursor.execute("""
            SELECT 
                f.user1_id,
                f.user2_id,
                f.chat_id,
                u1.full_name as user1_name,
                u2.full_name as user2_name,
                c.chat_name
            FROM 
                Friendships f
            JOIN 
                User u1 ON f.user1_id = u1.user_id
            JOIN 
                User u2 ON f.user2_id = u2.user_id
            JOIN
                Chat c ON f.chat_id = c.chat_id
            WHERE 
                f.user1_id = %s AND f.user2_id = %s
        """, (user_id1, user_id2))
        
        return cursor.fetchone()
        
    except Exception as e:
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def create_friend_request(sender_id, receiver_id):
    """
    Create a friend request from sender to receiver.
    
    Args:
        sender_id (int): The ID of the user sending the request
        receiver_id (int): The ID of the user receiving the request
        
    Returns:
        dict: A dictionary containing the friend request details if successful, None if failed
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            print("Failed to get database connection")
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if users exist
        cursor.execute("SELECT user_id, full_name FROM User WHERE user_id IN (%s, %s)", (sender_id, receiver_id))
        users = cursor.fetchall()
        if len(users) != 2:
            print(f"Users not found: {users}")
            return {"error": "One or both users do not exist"}
            
        # Check if friendship already exists
        cursor.execute("""
            SELECT * FROM Friendships 
            WHERE (user1_id = %s AND user2_id = %s) 
            OR (user1_id = %s AND user2_id = %s)
        """, (sender_id, receiver_id, receiver_id, sender_id))
        if cursor.fetchone():
            print("Friendship already exists")
            return {"error": "Friendship already exists"}
            
        # Check if a pending request already exists
        cursor.execute("""
            SELECT * FROM FriendRequests 
            WHERE sender_id = %s AND receiver_id = %s AND status = 'Pending'
        """, (sender_id, receiver_id))
        if cursor.fetchone():
            print("Pending request already exists")
            return {"error": "Friend request already exists"}
            
        # Create the friend request
        try:
            cursor.execute("""
                INSERT INTO FriendRequests (sender_id, receiver_id, status, sent_at) 
                VALUES (%s, %s, 'Pending', NOW())
            """, (sender_id, receiver_id))
            connection.commit()
            print("Friend request created successfully")
        except Exception as e:
            print(f"Error creating friend request: {str(e)}")
            connection.rollback()
            return None
        
        # Get the created request details
        cursor.execute("""
            SELECT 
                fr.sender_id,
                fr.receiver_id,
                fr.status,
                fr.sent_at,
                u1.full_name as sender_name,
                u2.full_name as receiver_name
            FROM 
                FriendRequests fr
            JOIN 
                User u1 ON fr.sender_id = u1.user_id
            JOIN 
                User u2 ON fr.receiver_id = u2.user_id
            WHERE 
                fr.sender_id = %s AND fr.receiver_id = %s AND fr.status = 'Pending'
        """, (sender_id, receiver_id))
        
        request = cursor.fetchone()
        if request and request['sent_at']:
            request['sent_at'] = request['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return request
        
    except Exception as e:
        print(f"Error in create_friend_request: {str(e)}")
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_pending_friend_requests(user_id):
    """
    Get all pending friend requests for a user.
    
    Args:
        user_id (int): The ID of the user
        
    Returns:
        list: A list of dictionaries containing pending friend requests
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        cursor.execute("""
            SELECT 
                fr.sender_id,
                fr.receiver_id,
                fr.status,
                fr.sent_at,
                u1.full_name as sender_name,
                u2.full_name as receiver_name
            FROM 
                FriendRequests fr
            JOIN 
                User u1 ON fr.sender_id = u1.user_id
            JOIN 
                User u2 ON fr.receiver_id = u2.user_id
            WHERE 
                fr.receiver_id = %s
                AND fr.status = 'Pending'
            ORDER BY 
                fr.sent_at DESC
        """, (user_id,))
        
        requests = cursor.fetchall()
        
        # Format timestamps
        for request in requests:
            if request['sent_at']:
                request['sent_at'] = request['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return requests
        
    except Exception as e:
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def update_friend_request(sender_id, receiver_id, new_status):
    """
    Update a friend request's status.
    
    Args:
        sender_id (int): The ID of the user who sent the request
        receiver_id (int): The ID of the user who received the request
        new_status (str): The new status ('Accepted' or 'Rejected')
        
    Returns:
        dict: A dictionary containing the updated friend request details if successful, None if failed
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Get the request details
        cursor.execute("""
            SELECT * FROM FriendRequests 
            WHERE sender_id = %s AND receiver_id = %s AND status = 'Pending'
        """, (sender_id, receiver_id))
        
        request = cursor.fetchone()
        if not request:
            return {"error": "Friend request not found or already processed"}
            
        # Update the request status
        cursor.execute("""
            UPDATE FriendRequests 
            SET status = %s
            WHERE sender_id = %s AND receiver_id = %s
        """, (new_status, sender_id, receiver_id))
        
        # If accepted, create the friendship
        if new_status == 'Accepted':
            friendship = create_friendship(sender_id, receiver_id)
            if not friendship:
                connection.rollback()
                return {"error": "Failed to create friendship"}
        
        connection.commit()
        
        # Get the updated request details
        cursor.execute("""
            SELECT 
                fr.sender_id,
                fr.receiver_id,
                fr.status,
                fr.sent_at,
                u1.full_name as sender_name,
                u2.full_name as receiver_name
            FROM 
                FriendRequests fr
            JOIN 
                User u1 ON fr.sender_id = u1.user_id
            JOIN 
                User u2 ON fr.receiver_id = u2.user_id
            WHERE 
                fr.sender_id = %s AND fr.receiver_id = %s
        """, (sender_id, receiver_id))
        
        updated_request = cursor.fetchone()
        
        # Format timestamp
        if updated_request and updated_request['sent_at']:
            updated_request['sent_at'] = updated_request['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return updated_request
        
    except Exception as e:
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_sent_friend_requests(user_id):
    """
    Get all friend requests sent by a user.
    
    Args:
        user_id (int): The ID of the user who sent the requests
        
    Returns:
        list: A list of dictionaries containing sent friend requests
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        cursor.execute("""
            SELECT 
                fr.sender_id,
                fr.receiver_id,
                fr.status,
                fr.sent_at,
                u1.full_name as sender_name,
                u2.full_name as receiver_name
            FROM 
                FriendRequests fr
            JOIN 
                User u1 ON fr.sender_id = u1.user_id
            JOIN 
                User u2 ON fr.receiver_id = u2.user_id
            WHERE 
                fr.sender_id = %s
            ORDER BY 
                fr.sent_at DESC
        """, (user_id,))
        
        requests = cursor.fetchall()
        
        # Format timestamps
        for request in requests:
            if request['sent_at']:
                request['sent_at'] = request['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return requests
        
    except Exception as e:
        print(f"Error in get_sent_friend_requests: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close() 