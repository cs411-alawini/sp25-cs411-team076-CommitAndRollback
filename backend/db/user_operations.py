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