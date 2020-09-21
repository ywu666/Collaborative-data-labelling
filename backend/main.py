import os

import csv

import firebase_admin
from firebase_admin import auth
from bson import ObjectId
from firebase_admin import credentials
from flask import Flask, request, make_response
from flask_cors import CORS

from api import document_api, label_api, project_api, user_api

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

# Create folder for temporarily storing files
uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':

        if 'projectName' in request.form:
            project_name = str(request.form['projectName'])

            if 'inputFile' not in request.files:
                response = {'status_code': 400,
                            'message': 'No file selected'}
                response = make_response(response)
                return response

            file = request.files['inputFile']
            if file.filename == '':
                response = {'status_code': 400,
                            'message': 'No file selected'}
                response = make_response(response)
                return response
            if file:
                filename = secure_filename(file.filename)
                filelocation = os.path.join(uploads_dir, filename)
                file.save(filelocation)

                with open(filelocation) as csv_file:
                    csv_reader = csv.reader(csv_file, delimiter=",")
                    is_first_line = True

                    for row in csv_reader:
                        if is_first_line:
                            is_first_line = False
                        else:
                            document = Document(ObjectId(row[0]), [], row[1])
                            # Find project database and populate document collection
                            project = Project(project_name, [], [])
                            project.add_document(document)

                # Delete file when done
                os.remove(filelocation)

                response = {'status_code': 200,
                            'message': 'Documents imported successfully'}
                return make_response(response)
        else:
            response = {'status_code': 400,
                        'message': 'No project id provided'}
            response = make_response(response)
            return response


if __name__ == '__main__':
    app.run()
