from google.cloud.sql.connector import Connector
import pymysql
import sqlalchemy
from google.oauth2 import service_account

# Initialize credentials
credentials = service_account.Credentials.from_service_account_file(
    'creds.json',
    scopes=['https://www.googleapis.com/auth/cloud-platform'],
)

# Initialize the Cloud SQL Connector with credentials
connector = Connector(credentials=credentials)

def get_connection() -> pymysql.connections.Connection:
    connection = connector.connect(
        "database-systems-uiuc:us-central1:database-systems-411",  # Your instance connection name
        "pymysql",
        user="",       
        password="",   # Replace with your actual password
        db="synapo",
        enable_iam_auth=False  # Disable IAM authentication
    )
    return connection

# Set up SQLAlchemy engine
engine = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=get_connection,
) 