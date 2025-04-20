from .connection import get_connection
from pymysql.cursors import DictCursor

def get_all_groups():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT g.*, COUNT(gm.user_id) as member_count 
            FROM `Group` g 
            LEFT JOIN Group_Members gm ON g.group_id = gm.group_id 
            GROUP BY g.group_id
        """)
        groups = cursor.fetchall()
        return groups
    except Exception as e:
        print(f"Error in get_all_groups: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_group_recommendations(user_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        cursor.execute("""
            SELECT
                g.group_id,
                g.group_name,
                COUNT(gm.user_id) AS member_count
            FROM
                `Group` g
                JOIN User_Interests ui ON g.interest_id = ui.interest_id
                LEFT JOIN Group_Members gm ON g.group_id = gm.group_id
            WHERE
                ui.user_id = %s
                AND g.group_id NOT IN (
                    SELECT
                        group_id
                    FROM
                        Group_Members
                    WHERE
                        user_id = %s
                )
            GROUP BY
                g.group_id,
                g.group_name
            ORDER BY
                member_count DESC
            LIMIT
                15
        """, (user_id, user_id))
        recommendations = cursor.fetchall()
        return recommendations
    except Exception as e:
        print(f"Error in get_group_recommendations: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close() 