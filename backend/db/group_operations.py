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

def get_user_groups(user_id):
    """
    Get all groups where a user is a member.
    
    Args:
        user_id (int): The ID of the user
        
    Returns:
        list: A list of dictionaries containing all groups the user is a member of
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Get all groups where the user is a member
        cursor.execute("""
            SELECT 
                g.group_id,
                g.group_name,
                g.created_at,
                g.created_by,
                g.interest_id,
                g.chat_id,
                COUNT(gm2.user_id) as member_count
            FROM 
                `Group` g
            JOIN 
                Group_Members gm ON g.group_id = gm.group_id
            LEFT JOIN 
                Group_Members gm2 ON g.group_id = gm2.group_id
            WHERE 
                gm.user_id = %s
            GROUP BY 
                g.group_id
            ORDER BY 
                g.created_at DESC
        """, (user_id,))
        
        groups = cursor.fetchall()
        
        # Format the created_at timestamps
        for group in groups:
            if group['created_at']:
                group['created_at'] = group['created_at'].strftime('%a, %d %b %Y %H:%M:%S GMT')
                
        return groups
    except Exception as e:
        print(f"Error in get_user_groups: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def add_user_to_group(user_id, group_id):
    """
    Add a user to a group.
    
    Args:
        user_id (int): The ID of the user
        group_id (int): The ID of the group
        
    Returns:
        dict: A dictionary containing the result of the operation
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if the user is already a member of the group
        cursor.execute("""
            SELECT 1 FROM Group_Members 
            WHERE user_id = %s AND group_id = %s
        """, (user_id, group_id))
        
        if cursor.fetchone():
            return {"error": "User is already a member of this group"}
        
        # Check if the group exists
        cursor.execute("""
            SELECT 1 FROM `Group` 
            WHERE group_id = %s
        """, (group_id,))
        
        if not cursor.fetchone():
            return {"error": "Group not found"}
        
        # Check if the user exists
        cursor.execute("""
            SELECT 1 FROM User 
            WHERE user_id = %s
        """, (user_id,))
        
        if not cursor.fetchone():
            return {"error": "User not found"}
        
        # Add the user to the group
        cursor.execute("""
            INSERT INTO Group_Members (user_id, group_id) 
            VALUES (%s, %s)
        """, (user_id, group_id))
        
        connection.commit()
        
        return {"success": True, "message": "User added to group successfully"}
    except Exception as e:
        print(f"Error in add_user_to_group: {str(e)}")
        if connection:
            connection.rollback()
        return {"error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close() 