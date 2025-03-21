from flask import Flask
from flask_cors import CORS
from api.routes import setup_routes

app = Flask(__name__)
CORS(app)

# Set up routes
setup_routes(app)

if __name__ == '__main__':
    app.run(debug=True, port=5001) 