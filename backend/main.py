import os

import csv
from flask import Flask, request, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename

from api import document_api, label_api, project_api, user_api
from model.document import Document
from model.label import Label
from model.project import Project

app = Flask(__name__)
app.register_blueprint(document_api.document_api)
app.register_blueprint(label_api.label_api)
app.register_blueprint(project_api.project_api)
app.register_blueprint(user_api.user_api)


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
                            document = Document(int(row[0]), row[1])
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

#endpoint to add/delete/get preset labels
@app.route('/presetlabels', methods=['POST', 'GET', 'DELETE'])
def presetLabels():
    requestPresent = False
    if (request.method == 'GET'):
        return Project.preset_labels
    for labels in Project.preset_labels:
        if (labels == Label(request.json['label'])):
            requestPresent = True
    if (request.method == 'POST'):
        if requestPresent:
            response = {'status_code': 400, 'message':"Label already set"}
        else:
            response = {'status_code': 200, 'message':"Added label successfully"}
            Project.preset_labels.append(request.json['label'])
        response = make_response(response)
        return response
    if(request.method == 'DELETE'):
        if requestPresent:
            Project.preset_labels.remove(request.json['label'])
            response = {'status_code': 200, 'message': "Label deleted successfully"}
        else:
            response = {'status_code': 400, 'message': "Label was not set"}
        response = make_response(response)
        return response
                
if __name__ == '__main__':
    app.run()
