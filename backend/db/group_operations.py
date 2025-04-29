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

def get_group_members(group_id):
    """
    Get all members of a group.
    
    Args:
        group_id (int): The ID of the group
        
    Returns:
        list: A list of dictionaries containing member details
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if group exists
        cursor.execute("SELECT 1 FROM `Group` WHERE group_id = %s", (group_id,))
        if not cursor.fetchone():
            return {"error": "Group not found"}
        
        # Get all members with their details
        cursor.execute("""
            SELECT 
                u.user_id,
                u.full_name,
                u.location,
                u.bio,
                gm.joined_at
            FROM 
                Group_Members gm
            JOIN 
                User u ON gm.user_id = u.user_id
            WHERE 
                gm.group_id = %s
            ORDER BY 
                gm.joined_at DESC
        """, (group_id,))
        
        members = cursor.fetchall()
        
        # Format timestamps
        for member in members:
            if member['joined_at']:
                member['joined_at'] = member['joined_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return members
    except Exception as e:
        print(f"Error in get_group_members: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_group_events(group_id):
    """
    Get all events of a group.
    
    Args:
        group_id (int): The ID of the group
        
    Returns:
        list: A list of dictionaries containing event details
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if group exists
        cursor.execute("SELECT 1 FROM `Group` WHERE group_id = %s", (group_id,))
        if not cursor.fetchone():
            return {"error": "Group not found"}
        
        # Get all events with creator details
        cursor.execute("""
            SELECT 
                e.event_id,
                e.event_name,
                e.group_id,
                e.created_by,
                u.full_name as creator_name
            FROM 
                Event e
            JOIN 
                User u ON e.created_by = u.user_id
            WHERE 
                e.group_id = %s
            ORDER BY 
                e.event_id DESC
        """, (group_id,))
        
        events = cursor.fetchall()
        return events
    except Exception as e:
        print(f"Error in get_group_events: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def remove_user_from_group(group_id, user_id):
    """
    Remove a user from a group.
    
    Args:
        group_id (int): The ID of the group
        user_id (int): The ID of the user to remove
        
    Returns:
        dict: A dictionary containing a success message if successful, None if failed
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # First verify the group exists
        cursor.execute("SELECT * FROM `Group` WHERE group_id = %s", (group_id,))
        group = cursor.fetchone()
        if not group:
            return {"error": "Group not found"}
            
        # Then verify the user is a member of the group
        cursor.execute("""
            SELECT * FROM Group_Members 
            WHERE group_id = %s AND user_id = %s
        """, (group_id, user_id))
        
        if not cursor.fetchone():
            return {"error": "User is not a member of this group"}
            
        # Remove user from the group
        cursor.execute("""
            DELETE FROM Group_Members 
            WHERE group_id = %s AND user_id = %s
        """, (group_id, user_id))
        
        connection.commit()
        
        return {"message": "User removed from group successfully"}
        
    except Exception as e:
        print(f"Error in remove_user_from_group: {str(e)}")
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def search_groups(search_term, limit=None, current_user_id=None):
    """
    Search for groups by name.
    
    Args:
        search_term (str): The search term to match against group names
        limit (int, optional): Limit the number of results (default: None)
        current_user_id (int, optional): The ID of the current user (default: None)
        
    Returns:
        list: A list of dictionaries containing matched groups
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Build the search query
        query = """
            SELECT g.*, COUNT(gm.user_id) as member_count,
            CASE WHEN EXISTS (
                SELECT 1 FROM Group_Members 
                WHERE group_id = g.group_id AND user_id = %s
            ) THEN TRUE ELSE FALSE END as is_member
            FROM `Group` g 
            LEFT JOIN Group_Members gm ON g.group_id = gm.group_id 
            WHERE g.group_name LIKE %s 
            GROUP BY g.group_id
            ORDER BY g.group_name ASC
        """
        
        # Add limit if specified
        if limit:
            query += " LIMIT %s"
            
        # Execute the query with or without limit
        if limit:
            cursor.execute(query, (current_user_id or 0, f"%{search_term}%", limit))
        else:
            cursor.execute(query, (current_user_id or 0, f"%{search_term}%"))
            
        groups = cursor.fetchall()
        
        # Format timestamps
        for group in groups:
            if group['created_at']:
                group['created_at'] = group['created_at'].strftime('%a, %d %b %Y %H:%M:%S GMT')
                
        return groups
    except Exception as e:
        print(f"Error in search_groups: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_group_by_id(group_id):
    """
    Get a group by its ID.
    
    Args:
        group_id (int): The ID of the group
        
    Returns:
        dict: A dictionary containing the group's information if found, None otherwise
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Get group details
        cursor.execute("""
            SELECT 
                g.group_id,
                g.group_name,
                g.created_at,
                g.created_by,
                g.interest_id,
                g.chat_id,
                COUNT(gm.user_id) as member_count
            FROM 
                `Group` g
            LEFT JOIN 
                Group_Members gm ON g.group_id = gm.group_id
            WHERE 
                g.group_id = %s
            GROUP BY 
                g.group_id
        """, (group_id,))
        
        group = cursor.fetchone()
        
        if group and group['created_at']:
            group['created_at'] = group['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return group
    except Exception as e:
        print(f"Error in get_group_by_id: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close() 
