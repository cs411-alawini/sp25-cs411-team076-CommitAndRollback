from google.cloud.sql.connector import Connector
import pymysql
import sqlalchemy
from google.oauth2 import service_account
import os
import json

def get_credentials():
    # Try to get credentials from environment variable
    creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
    if creds_json:
        try:
            creds_dict = json.loads(creds_json)
            return service_account.Credentials.from_service_account_info(
                creds_dict,
                scopes=['https://www.googleapis.com/auth/cloud-platform'],
            )
        except json.JSONDecodeError:
            pass
    
    # Fall back to file if environment variable is not set
    creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'creds.json')
    return service_account.Credentials.from_service_account_file(
        creds_path,
        scopes=['https://www.googleapis.com/auth/cloud-platform'],
    )

# Initialize credentials
credentials = get_credentials()

# Initialize the Cloud SQL Connector with credentials
connector = Connector(credentials=credentials)

def get_connection() -> pymysql.connections.Connection:
    connection = connector.connect(
        "database-systems-uiuc:us-central1:database-systems-411",  # Your instance connection name
        "pymysql",
        user="root",       
        password="synapo-411-database",
        db="synapo",
        enable_iam_auth=False  # Disable IAM authentication
    )
    return connection

# Set up SQLAlchemy engine
engine = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=get_connection,
) 