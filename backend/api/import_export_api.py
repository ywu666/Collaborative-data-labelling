import csv
import os

from api.methods import JSONEncoder
from bson import ObjectId
from firebase_auth import get_email
from flask import Blueprint, request, make_response
from model.document import Document, get_db_collection
from mongoDBInterface import get_col
from werkzeug.utils import secure_filename

# Create folder for temporarily storing files
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

    # Check file name
    if file.filename == '':
        response = {'message': 'No file selected'}
        response = make_response(response)
        return response, 400

    # Check file type
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() == "csv"):
        response = {'message': 'Can only import CSV files'}
        response = make_response(response)
        return response, 400

    if file:
        filename = secure_filename(file.filename)
        filelocation = os.path.join(uploads_dir, filename)
        file.save(filelocation)

        documents_to_import = []
        conflicting_display_id_docs = []
        response = {'message': 'Documents imported successfully'}

        with open(filelocation) as csv_file:

            csv_reader = csv.reader(csv_file, delimiter=",")

            is_first_line = True

            # Default is that user provides their own IDs
            generate_display_ids = False
            id_value_index = None
            doc_value_index = None

            doc_col = get_col(project_name, "documents")
            ids_in_db = []
            ids_incorrectly_formatted = []
            docs = doc_col.find({}, {'display_id': 1})
            for doc in docs:
                ids_in_db.append(doc['display_id'])

            for row in csv_reader:
                if is_first_line:
                    is_first_line = False

                    # Check number of fields
                    if len(row) == 1:
                        doc_value_index = 0
                        # Check for proper formatting
                        if row[doc_value_index] != "DOCUMENT":
                            response = {'message': 'File formatted incorrectly: first field should be DOCUMENT'}
                            break

                        generate_display_ids = True
                    else:
                        id_value_index = 0
                        doc_value_index = 1

                        # Check for proper formatting
                        if "ID" not in row[id_value_index]:
                            response = {'message': 'File formatted incorrectly: first field should be ID'}
                            break

                        if row[doc_value_index] != "DOCUMENT":
                            response = {'message': 'File formatted incorrectly: second field should be DOCUMENT'}
                            break
                else:
                    doc_value = row[doc_value_index].strip()

                    if not generate_display_ids:  # CASE 1: Do not need to generate display IDs
                        # Check that ID is type int
                        try:
                            int(row[id_value_index])
                        except ValueError:
                            if len(documents_to_import) > 0:
                                ids_incorrectly_formatted.append(row[id_value_index])
                                continue
                            else:
                                response = {'message': 'File formatted incorrectly: ID needs to be int'}
                                break

                        # ID Uniqueness check
                        if row[id_value_index] in ids_in_db:
                            conflicting_display_id_docs.append(row[id_value_index])
                        else:
                            document = Document(row[id_value_index], doc_value, [], [])
                            documents_to_import.append(document.__dict__)
                            ids_in_db.append(row[id_value_index])
                    else:  # CASE 2: Generate display IDs
                        start_index = doc_col.count_documents({}) - 1
                        id_counter = 1

                        new_id = start_index + id_counter
                        while new_id in ids_in_db:
                            new_id += 1
                            id_counter += 1

                        document = Document(new_id, doc_value, [], [])
                        documents_to_import.append(document.__dict__)
                        ids_in_db.append(new_id)
                        id_counter += 1

        # Delete file when done
        os.remove(filelocation)

        # Insert docs
        if len(documents_to_import) > 0:
            doc_col.insert_many(documents_to_import)

        if len(conflicting_display_id_docs) > 0 and len(ids_incorrectly_formatted) > 0:
            response = {'Documents with IDs already in system': list(conflicting_display_id_docs),
                        'Documents with incorrectly formatted IDs': list(ids_incorrectly_formatted)}
        elif len(conflicting_display_id_docs) > 0:
            response = {'Documents with IDs already in system': list(conflicting_display_id_docs)}
        elif len(ids_incorrectly_formatted) > 0:
            response = {'Documents with incorrectly formatted IDs': list(ids_incorrectly_formatted)}

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
        docs_to_write.append({'ID': d['_id'], 'DOCUMENT': d['data'], 'LABEL': final_label})
    docs = JSONEncoder().encode(docs_to_write)
    return docs, 200
