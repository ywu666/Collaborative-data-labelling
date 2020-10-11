import csv
import os

from api.methods import JSONEncoder, check_all_labels_for_document_match, get_label_name_by_label_id
from api.validation_methods import check_id_token
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
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    if 'projectName' in request.form:
        project_name = str(request.form['projectName'])
    else:
        response = {'message': 'No project id provided'}
        response = make_response(response)
        return response, 400

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email},
                                   {'$or': [{'isContributor': True}, {'isAdmin': True}]})
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
        response = {'message': 'Incorrect filetype/format'}
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
                            response = {'message': 'Incorrect filetype/format'}
                            break

                        generate_display_ids = True
                    else:
                        id_value_index = 0
                        doc_value_index = 1

                        # Check for proper formatting
                        if "ID" not in row[id_value_index]:
                            response = {'message': 'Incorrect filetype/format'}
                            break

                        if row[doc_value_index] != "DOCUMENT":
                            response = {'message': 'Incorrect filetype/format'}
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
                                response = {'message': 'Incorrect filetype/format'}
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

        if response == {'message': 'Incorrect filetype/format'}:
            print("true")
            return make_response(response), 400
        else:
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
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

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
        docs_to_write.append({'ID': d['display_id'], 'DOCUMENT': d['data'],
                              'LABEL': final_label, 'LABEL STATUS': doc_label_status,
                              'CONTRIBUTOR 1 LABEL': contributor_one_label,
                              'CONTRIBUTOR 2 LABEL': contributor_two_label})
    docs = JSONEncoder().encode(docs_to_write)
    return docs, 200
