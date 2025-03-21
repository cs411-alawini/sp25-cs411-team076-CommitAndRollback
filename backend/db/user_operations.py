from .connection import get_connection
from pymysql.cursors import DictCursor

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