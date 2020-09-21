import firebase_admin
from api import document_api, label_api, project_api, user_api
from firebase_admin import auth
from firebase_admin import credentials
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(document_api.document_api)
app.register_blueprint(label_api.label_api)
app.register_blueprint(project_api.project_api)
app.register_blueprint(user_api.user_api)

cred = credentials.Certificate("collaborative-content-coding-firebase-adminsdk-dpj86-0d9f3ad3d8.json")
default_app = firebase_admin.initialize_app(cred)

# Start listing users from the beginning, 1000 at a time.
page = auth.list_users()
cors = CORS(app)


if __name__ == '__main__':
    app.run()
