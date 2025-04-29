import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
from api.routes import setup_routes
from db.chat_operations import get_group_messages, send_group_message
from db.user_operations import get_user_by_id, get_user_by_username
from db.group_operations import get_group_by_id, get_group_members, add_user_to_group
from gemini_api import summarize_messages
from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import setup_routes
import os

app = Flask(__name__)
CORS(app)

# Set up routes
setup_routes(app)

@app.route('/api/groups/<int:group_id>/summarize', methods=['POST'])
def summarize_group_messages(group_id):
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
            
        # Generate summary using Gemini
        summary = summarize_messages(messages)
        
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Add a health check endpoint
@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "Backend service is running"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8081))
    app.run(host='0.0.0.0', port=port, debug=False) 