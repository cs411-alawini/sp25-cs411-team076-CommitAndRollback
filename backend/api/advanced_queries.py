from flask import Blueprint, jsonify, request
from db.connection import get_connection
import mysql.connector
from typing import Optional, List, Dict, Any
from pymysql.cursors import DictCursor

advanced_queries_bp = Blueprint('advanced_queries', __name__)

@advanced_queries_bp.route('/recommended-groups', methods=['GET'])
def get_recommended_groups():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Start transaction
        cursor.execute("START TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        # Query: Recommend groups based on user interests
        cursor.execute("""
            SELECT
                g.group_id,
                g.group_name,
                g.created_at,
                COUNT(gm.user_id) AS member_count,
                COUNT(DISTINCT m.message_id) AS message_count,
                COUNT(DISTINCT e.event_id) AS event_count
            FROM
                `Group` g
                JOIN User_Interests ui ON g.interest_id = ui.interest_id
                LEFT JOIN Group_Members gm ON g.group_id = gm.group_id
                LEFT JOIN Messages m ON g.chat_id = m.chat_id
                LEFT JOIN Event e ON g.group_id = e.group_id
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
                g.group_name,
                g.created_at
            ORDER BY
                member_count DESC,
                message_count DESC,
                event_count DESC
            LIMIT 10
        """, (user_id, user_id))
        
        recommended_groups = cursor.fetchall()
        
        # Commit transaction
        cursor.execute("COMMIT")
        
        return jsonify({
            'groups': recommended_groups
        })
        
    except mysql.connector.Error as err:
        # Rollback in case of error
        cursor.execute("ROLLBACK")
        return jsonify({'error': str(err)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def get_active_groups() -> Optional[List[Dict[str, Any]]]:
    """
    Get the most active groups based on message and event activity.
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
                g.group_id,
                g.group_name,
                g.created_at,
                COUNT(DISTINCT m.message_id) as message_count,
                COUNT(DISTINCT e.event_id) as event_count
            FROM `Group` g
            LEFT JOIN Messages m ON g.chat_id = m.chat_id
            LEFT JOIN Event e ON g.group_id = e.group_id
            GROUP BY g.group_id
            ORDER BY (message_count + event_count) DESC
            LIMIT 10
        """)
        groups = cursor.fetchall()
        return groups
    except Exception as e:
        print(f"Error getting active groups: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Update the route to remove user_id parameter
@advanced_queries_bp.route('/active-groups', methods=['GET'])
def get_active_groups_route():
    groups = get_active_groups()
    if groups is None:
        return jsonify({"error": "Failed to fetch active groups"}), 500
    return jsonify(groups) 