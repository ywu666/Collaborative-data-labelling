# Create folder for temporarily storing files
import csv
import os

import mongoDBInterface
from bson import ObjectId
from flask import Blueprint, request, make_response
from model.document import Document, get_db_collection
from model.project import Project
from werkzeug.utils import secure_filename

uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)

import_export_api = Blueprint('import_export_api', __name__)


@import_export_api.route('/project/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':

        if 'projectName' in request.form:
            project_name = str(request.form['projectName'])

            if 'inputFile' not in request.files:
                response = {'message': 'No file selected'}
                response = make_response(response)
                return response, 400

            file = request.files['inputFile']
            if file.filename == '':
                response = {'message': 'No file selected'}
                response = make_response(response)
                return response, 400
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
                            document = Document(row[1], [], [])
                            # Find project database and populate document collection
                            project = Project(project_name, [], [])
                            project.add_document(document)

                # Delete file when done
                os.remove(filelocation)

                response = {'message': 'Documents imported successfully'}
                response = make_response(response)
                return response, 200
        else:
            response = {'message': 'No project id provided'}
            response = make_response(response)
            return response, 400


@import_export_api.route('/project/export', methods=['GET'])
def export_documents():
    

    return '', 200