# Create folder for temporarily storing files
import csv
import os

from api.methods import JSONEncoder
from bson import ObjectId
from firebase_auth import get_email
from flask import Blueprint, request, make_response, Response, send_file
from model.document import Document, get_db_collection
from model.project import Project
from mongoDBInterface import get_col
from werkzeug.utils import secure_filename

uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)

import_export_api = Blueprint('import_export_api', __name__)


# Endpoint for uploading and importing documents from file
@import_export_api.route('/projects/upload', methods=['POST'])
def upload_file():
    id_token = request.args.get('id_token')

    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}
        response = make_response(response)
        return response, 400

    requestor_email = get_email(id_token)

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}
        response = make_response(response)
        return response, 400


    if request.method == 'POST':

        if 'projectName' in request.form:
            project_name = str(request.form['projectName'])
        else:
            response = {'message': 'No project id provided'}
            response = make_response(response)
            return response, 400

        users_col = get_col(project_name, "users")
        requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
        if requestor is None:
            response = {'message': "You are not authorised to perform this action"}
            response = make_response(response)
            return response, 403

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


# Endpoint for exporting documents with labels for project
@import_export_api.route('/projects/<project_name>/export', methods=['GET'])
def export_documents(project_name):
    id_token = request.args.get('id_token')

    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}
        response = make_response(response)
        return response, 400

    requestor_email = get_email(id_token)

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}
        response = make_response(response)
        return response, 400

    user_col = get_col(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})

    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    # get all documents
    doc_col = get_db_collection(project_name, "documents")
    documents = doc_col.find(projection={'comments': 0})

    docs_to_write = []
    # Generate data in correct format for export
    for d in documents:
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
            label_col = get_db_collection(project_name, 'labels')
            final_label = label_col.find_one({"_id": ObjectId(final_label_id)})
            final_label = final_label['name']
        else:
            final_label = ''

        # make dictionary
        docs_to_write.append({"ID": d['_id'], "DOCUMENT": d['data'], "LABEL": final_label})

    # write to csv
    with open('export.csv', 'w', newline='') as csv_file:
        fieldnames = ["ID", "DOCUMENT", "LABEL"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(docs_to_write)

    return send_file('export.csv', as_attachment=True)

