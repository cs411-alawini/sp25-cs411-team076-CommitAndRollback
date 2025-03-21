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