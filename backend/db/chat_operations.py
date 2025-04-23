from .connection import get_connection
from pymysql.cursors import DictCursor
from datetime import datetime

def send_message(sender_id, receiver_id, message_text):
    """
    Send a message from one user to another.
    If a chat doesn't exist between the users, it will be created.
    
    Args:
        sender_id (int): The ID of the sender
        receiver_id (int): The ID of the receiver
        message_text (str): The text of the message
        
    Returns:
        dict: A dictionary containing the message information
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if a chat already exists between the users
        cursor.execute("""
            SELECT chat_id FROM Friendships 
            WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
        """, (sender_id, receiver_id, receiver_id, sender_id))
        
        friendship = cursor.fetchone()
        
        if friendship:
            # Chat already exists, use the existing chat_id
            chat_id = friendship['chat_id']
        else:
            # Create a new chat
            cursor.execute("SELECT MAX(chat_id) as max_id FROM Chat")
            result = cursor.fetchone()
            next_chat_id = (result['max_id'] or 0) + 1
            
            # Create a chat name based on the users
            cursor.execute("SELECT full_name FROM User WHERE user_id IN (%s, %s)", (sender_id, receiver_id))
            names = [row['full_name'] for row in cursor.fetchall()]
            chat_name = f"Chat between {names[0]} and {names[1]}"
            
            # Insert the new chat
            cursor.execute("""
                INSERT INTO Chat (chat_id, chat_name) VALUES (%s, %s)
            """, (next_chat_id, chat_name))
            
            # Create a new friendship with the chat
            cursor.execute("""
                INSERT INTO Friendships (user1_id, user2_id, chat_id) VALUES (%s, %s, %s)
            """, (sender_id, receiver_id, next_chat_id))
            
            chat_id = next_chat_id
        
        # Get the latest message_id and increment by 1
        cursor.execute("SELECT MAX(message_id) as max_id FROM Messages")
        result = cursor.fetchone()
        next_message_id = (result['max_id'] or 0) + 1
        
        # Set sent_at to current timestamp
        sent_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Insert the new message
        cursor.execute("""
            INSERT INTO Messages (
                message_id, sender_id, chat_id, message_text, sent_at
            ) VALUES (
                %s, %s, %s, %s, %s
            )
        """, (
            next_message_id,
            sender_id,
            chat_id,
            message_text,
            sent_at
        ))
        
        connection.commit()
        
        # Get the inserted message
        cursor.execute("""
            SELECT 
                m.message_id,
                m.sender_id,
                u.full_name AS sender_name,
                m.message_text,
                m.sent_at,
                m.chat_id
            FROM 
                Messages m
            JOIN 
                User u ON m.sender_id = u.user_id
            WHERE 
                m.message_id = %s
        """, (next_message_id,))
        
        message = cursor.fetchone()
        
        # Format the sent_at timestamp
        if message and message['sent_at']:
            message['sent_at'] = message['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return message
    except Exception as e:
        print(f"Error in send_message: {str(e)}")
        if connection:
            connection.rollback()
        return {"error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_chat_messages(user_id1, user_id2):
    """
    Get all messages in a chat between two users.
    
    Args:
        user_id1 (int): The ID of the first user
        user_id2 (int): The ID of the second user
        
    Returns:
        list: A list of dictionaries containing all messages in the chat
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # First get the chat_id for these two users
        cursor.execute("""
            SELECT chat_id 
            FROM Friendships 
            WHERE (user1_id = %s AND user2_id = %s) 
               OR (user1_id = %s AND user2_id = %s)
        """, (user_id1, user_id2, user_id2, user_id1))
        
        friendship = cursor.fetchone()
        if not friendship:
            return {"error": "No chat found between these users"}
            
        chat_id = friendship['chat_id']
        
        # Get all messages in this chat
        cursor.execute("""
            SELECT 
                m.message_id,
                m.sender_id,
                u.full_name AS sender_name,
                m.message_text,
                m.sent_at,
                m.chat_id
            FROM 
                Messages m
            JOIN 
                User u ON m.sender_id = u.user_id
            WHERE 
                m.chat_id = %s
            ORDER BY 
                m.sent_at ASC
        """, (chat_id,))
        
        messages = cursor.fetchall()
        
        # Format the sent_at timestamps
        for message in messages:
            if message['sent_at']:
                message['sent_at'] = message['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return messages
    except Exception as e:
        print(f"Error in get_chat_messages: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def get_group_messages(group_id):
    """
    Get all messages in a group chat.
    
    Args:
        group_id (int): The ID of the group
        
    Returns:
        list: A list of dictionaries containing all messages in the group chat
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # First get the chat_id for this group
        cursor.execute("""
            SELECT chat_id 
            FROM `Group` 
            WHERE group_id = %s
        """, (group_id,))
        
        group = cursor.fetchone()
        if not group:
            return {"error": "Group not found"}
            
        chat_id = group['chat_id']
        
        # Get all messages in this chat
        cursor.execute("""
            SELECT 
                m.message_id,
                m.sender_id,
                u.full_name AS sender_name,
                m.message_text,
                m.sent_at,
                m.chat_id
            FROM 
                Messages m
            JOIN 
                User u ON m.sender_id = u.user_id
            WHERE 
                m.chat_id = %s
            ORDER BY 
                m.sent_at ASC
        """, (chat_id,))
        
        messages = cursor.fetchall()
        
        # Format the sent_at timestamps
        for message in messages:
            if message['sent_at']:
                message['sent_at'] = message['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
                
        return messages
    except Exception as e:
        print(f"Error in get_group_messages: {str(e)}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def send_group_message(group_id, user_id, message_text):
    """
    Send a message to a group chat.
    
    Args:
        group_id (int): The ID of the group
        user_id (int): The ID of the user sending the message
        message_text (str): The text of the message (can be empty)
        
    Returns:
        dict: A dictionary containing the message information
    """
    connection = None
    cursor = None
    try:
        connection = get_connection()
        if not connection:
            return None
            
        cursor = connection.cursor(DictCursor)
        
        # Check if the user is a member of the group
        cursor.execute("""
            SELECT 1 FROM Group_Members 
            WHERE group_id = %s AND user_id = %s
        """, (group_id, user_id))
        
        member = cursor.fetchone()
        if not member:
            return {"error": "User is not a member of this group"}
        
        # Get the chat_id for this group
        cursor.execute("""
            SELECT chat_id 
            FROM `Group` 
            WHERE group_id = %s
        """, (group_id,))
        
        group = cursor.fetchone()
        if not group:
            return {"error": "Group not found"}
            
        chat_id = group['chat_id']
        
        # Get the latest message_id and increment by 1
        cursor.execute("SELECT MAX(message_id) as max_id FROM Messages")
        result = cursor.fetchone()
        next_message_id = (result['max_id'] or 0) + 1
        
        # Set sent_at to current timestamp
        sent_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Ensure message_text is a string
        if message_text is None:
            message_text = ''
            
        # Insert the new message
        cursor.execute("""
            INSERT INTO Messages (
                message_id, sender_id, chat_id, message_text, sent_at
            ) VALUES (
                %s, %s, %s, %s, %s
            )
        """, (
            next_message_id,
            user_id,
            chat_id,
            message_text,
            sent_at
        ))
        
        connection.commit()
        
        # Get the inserted message
        cursor.execute("""
            SELECT 
                m.message_id,
                m.sender_id,
                u.full_name AS sender_name,
                m.message_text,
                m.sent_at,
                m.chat_id
            FROM 
                Messages m
            JOIN 
                User u ON m.sender_id = u.user_id
            WHERE 
                m.message_id = %s
        """, (next_message_id,))
        
        message = cursor.fetchone()
        
        # Format the sent_at timestamp
        if message and message['sent_at']:
            message['sent_at'] = message['sent_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return message
    except Exception as e:
        print(f"Error in send_group_message: {str(e)}")
        if connection:
            connection.rollback()
        return {"error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close() 