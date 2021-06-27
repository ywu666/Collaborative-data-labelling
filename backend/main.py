from database.model.model import init_db
import firebase_admin
import os
from api import document_api, label_api, project_api, user_api, import_export_api, document_label_api
from firebase_admin import auth
from firebase_admin import credentials
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)

init_db(app)

# app.register_blueprint(document_api.document_api)
# app.register_blueprint(document_label_api.document_label_api)
# app.register_blueprint(label_api.label_api)
# app.register_blueprint(project_api.project_api)
app.register_blueprint(user_api.user_api)
# app.register_blueprint(import_export_api.import_export_api)

cred = credentials.Certificate("collaborative-data-labelling-firebase-adminsdk-95tuz-b0d97a170a.json")
default_app = firebase_admin.initialize_app(cred)

# Start listing users from the beginning, 1000 at a time.
page = auth.list_users()
cors = CORS(app)


if __name__ == '__main__':
    app.run()
