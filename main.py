from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud.sql.connector import Connector
import pymysql
import sqlalchemy
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize the Cloud SQL Connector
connector = Connector()

# Function to establish a connection to the database
def get_connection() -> pymysql.connections.Connection:
    connection = connector.connect(
        "database-systems-uiuc:us-central1:database-systems-411",  # Your instance connection name
        "pymysql",
        user="root",       # Replace with your database username
        password="",   # Replace with your database password
        db="synapo",    # Replace with your database name
    )
    return connection

# Set up SQLAlchemy engine
engine = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=get_connection,
)

# User Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT user_id, full_name, gender, age, location, bio FROM User")
            users = cursor.fetchall()
            return jsonify(users)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
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
                return jsonify(user)
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

# Group Routes
@app.route('/api/groups', methods=['GET'])
def get_groups():
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT g.*, COUNT(gm.user_id) as member_count 
                FROM `Group` g 
                LEFT JOIN Group_Members gm ON g.group_id = gm.group_id 
                GROUP BY g.group_id
            """)
            groups = cursor.fetchall()
            return jsonify(groups)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

# Friend Recommendations Route (implementing Query 2 from your SQL)
@app.route('/api/users/<int:user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
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
            return jsonify(recommendations)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    return jsonify({"error": "Database connection failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 