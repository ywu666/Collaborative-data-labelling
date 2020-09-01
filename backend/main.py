import os

import csv
from flask import Flask, request, make_response
from flask import Flask, request, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename

from backend.model.document import Document
from backend.model.project import Project
from backend.model.label import Label

app = Flask(__name__)
cors = CORS(app)

# Create folder for temporarily storing files
uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"

@app.route('/addlabel', methods=['Post'])
def addLabel():
    if 'projectID' in request.json:
        projectID = int(request.json['projectID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing projectID"}
        response = make_response(response)
        return response

    if 'userID' in request.json:
        userID = int(request.json['userID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing userID"}
        response = make_response(response)
        return response

    if 'label' in request.json:
        label = Label(request.json['label'])
    else:
        response = {'status_code': 400,
                    'message': "Missing label"}
        response = make_response(response)
        return response

    ### Check user permisisions for project ###
    ### Add to DB ###

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
