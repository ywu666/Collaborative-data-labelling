# Create folder for temporarily storing files
import csv
import os

from bson import ObjectId
from flask import Blueprint, request, make_response, Response, send_file
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


# Endpoint for exporting documents with labels for project
@import_export_api.route('/project/export', methods=['GET'])
def export_documents():
    # Check request params
    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'message': "Missing projectID"}
        response = make_response(response)
        return response, 400

    # get all documents
    doc_col = get_db_collection(project, "documents")
    documents = doc_col.find(projection={'comments': 0})

    docs_to_write = [["ID", "BODY", "LABEL"]]

    # Generate data in correct format for export
    for d in documents[0:6]:
        id_as_string = str(d['_id'])

        # Find final label id
        user_and_labels = d['user_and_labels']
        final_label_id = None
        if len(user_and_labels) > 1:
            final_label_id = user_and_labels[0]['label']
            for item in user_and_labels:
                # check that label is the same
                if item['label'] != final_label_id:
                    final_label_id = None
                    break

        # Get label name
        if final_label_id is not None:
            label_col = get_db_collection(project, 'labels')
            final_label = label_col.find_one({"_id": ObjectId(final_label_id)})
            final_label = final_label['name']
        else:
            final_label = ''

        docs_to_write.append([id_as_string, d['data'], final_label])

    # Generator lets system create csv file without storing it locally
    def generate_csv():
        for doc in docs_to_write:
            yield ','.join(doc) + '\r\n'

    return Response(generate_csv(), mimetype='text/csv',
                    headers={"Content-Disposition": "attachment;filename=export.csv"})
