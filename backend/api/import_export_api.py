# Create folder for temporarily storing files
import csv
import os

from api.methods import JSONEncoder, check_all_labels_for_document_match, get_label_name_by_label_id
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
                        doc_col = get_col(project_name, "documents")
                        doc_col.insert_one(document.__dict__)

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

    # get all documents and labels
    label_col = get_db_collection(project_name, 'labels')
    doc_col = get_db_collection(project_name, "documents")
    documents = doc_col.find(projection={'comments': 0})

    # Get contributors of project?
    user_col = get_db_collection(project_name, "users")
    contributor_emails = user_col.find({'isContributor': True}, {'_id': 0, 'email': 1})
    # print(len(list(contributor_emails)))
    if len(list(contributor_emails)) == 2:
        contributor_one_index = 0
        contributor_two_index = 1
    elif len(list(contributor_emails)) == 1:
        contributor_one_index = 0

    docs_to_write = []
    # Generate data in correct format for export
    for d in documents:
        final_label_id = d['final_label']
        doc_label_status = "INCOMPLETE"

        num_contributors_labelled = len(d['user_and_labels'])
        contributor_one_label = ""
        contributor_two_label = ""

        # Set return field values
        if final_label_id is not None:
            final_label = get_label_name_by_label_id(label_col, final_label_id)
            doc_label_status = "AGREED AND CONFIRMED"

            contributor_one_label = get_label_name_by_label_id(label_col,
                                                               d['user_and_labels'][contributor_one_index]['label'])
            contributor_two_label = contributor_one_label
        elif num_contributors_labelled == 2:
            if d['user_and_labels'][contributor_one_index]['label_confirmed'] and \
                    d['user_and_labels'][contributor_two_index]['label_confirmed']:
                final_label = "DOCUMENT REDACTED"
                doc_label_status = "NO AGREEMENT AND CONFIRMED"
            else:
                final_label = ""
                doc_label_status = "LABELLED BUT UNCONFIRMED"

            contributor_one_label = get_label_name_by_label_id(label_col,
                                                               d['user_and_labels'][contributor_one_index]['label'])
            contributor_two_label = get_label_name_by_label_id(label_col,
                                                               d['user_and_labels'][contributor_two_index]['label'])

        else:
            final_label = ""
            if num_contributors_labelled == 1:
                # Handle ordering of contributors if there is only one contributor
                contributor_one_label = get_label_name_by_label_id(label_col,
                                                                   d['user_and_labels'][contributor_one_index]['label'])

        # make dictionary
        docs_to_write.append({'ID': d['_id'], 'DOCUMENT': d['data'],
                              'LABEL': final_label, 'LABEL STATUS': doc_label_status,
                              'CONTRIBUTOR 1 LABEL': contributor_one_label,
                              'CONTRIBUTOR 2 LABEL': contributor_two_label})
    docs = JSONEncoder().encode(docs_to_write)
    return docs, 200
