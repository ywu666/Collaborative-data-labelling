import os

import csv
from flask import Flask, request, make_response
from flask import Flask, request, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename

from backend.model.document import Document
from backend.model.project import Project
from backend.model.label import Label
from backend.model.user import  User
from backend.model.document import Document
from mongoDBInterface import get_col

app = Flask(__name__)
cors = CORS(app)

# Create folder for temporarily storing files
uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"

#endpoint to add/delete/get preset labels
@app.route('/presetlabels', methods=['POST', 'GET', 'DELETE'])
def presetLabels():
    label_present = False
    #make sure project id is passed
    if 'projectName' in request.form:
        project_name = str(request.form['projectName'])
        labels_col = get_col(project_name, "labels")
        labels_cursor = labels_col.find({"name: <label>"})
        labels = list(labels_cursor)
        if (request.method == 'GET'):
            return labels
        #identify if passed label is already in the preset list
        if 'label' in request.form:
            label = request.json['label']
            project = Project(project_name, [], [])
            if label in labels:
                label_present = True
            if (request.method == 'POST'):
                if label_present:
                    response = {'status_code': 400, 'message':"Label already set"}
                else:
                    response = {'status_code': 200, 'message':"Added label successfully"}
                    labels.append(label)
                    project.set_labels(labels)
                response = make_response(response)
                return response
            if(request.method == 'DELETE'):
                if label_present:
                    labels.remove(label)
                    project.set_labels(labels)
                    response = {'status_code': 200, 'message': "Label deleted successfully"}
                else:
                    response = {'status_code': 400, 'message': "Label was not set"}
                response = make_response(response)
                return response
        else:
            response = {'status_code': 400,
                    'message': 'No label value provided'}
            response = make_response(response)
            return response 
    else:
        response = {'status_code': 400,
                    'message': 'No project id provided'}
        response = make_response(response)
        return response 

#Endpoint to allow adding of labels to a document
@app.route('/addlabel', methods=['Post'])
def addLabel():
    if 'projectID' in request.json:
        projectID = int(request.json['projectID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing projectID"}
        response = make_response(response)
        return response

    if 'identifier' in request.json:
        identifier = int(request.json['identifier'])
    else:
        response = {'status_code': 400,
                    'message': "Missing identifier"}
        response = make_response(response)
        return response

    if 'email' in request.json:
        email = int(request.json['email'])
    else:
        response = {'status_code': 400,
                    'message': "Missing email"}
        response = make_response(response)
        return response

    if 'label' in request.json:
        label = Label(request.json['label'])
    else:
        response = {'status_code': 400,
                    'message': "Missing label"}
        response = make_response(response)
        return response

    # # Check user permisisions for project #
    # label = Label(label)
    #
    # # Get Document from id
    # document = Document()
    #
    # # Get User from id
    # first_name = "temp"
    # last_name = "temp"
    # permissions = []
    # user = User(first_name, last_name, email, permissions)
    #
    # document.add_user_and_label(user, label)

    response = {'status_code': 200,
                'message': "Added label succesfully"}
    response = make_response(response)
    return response


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


if __name__ == '__main__':
    app.run()
