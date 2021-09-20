from json import JSONEncoder

from database.user_dao import does_user_belong_to_a_project
from middleware.auth import check_token
from enums.user_role import UserRole
from database.project_dao import get_project_by_id, add_documents_to_database, create_new_document, \
    get_all_labels_of_a_project, get_all_users_associated_with_a_project, get_all_document_of_a_project
import csv
import os
import json
from api.validation_methods import user_unauthorised_response
from flask import Blueprint, request, make_response, g
from werkzeug.utils import secure_filename

# Create folder for temporarily storing files
uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)

import_export_api = Blueprint('import_export_api', __name__)


# Endpoint for uploading and importing documents from file
@import_export_api.route('/projects/upload', methods=['POST'])
@check_token
def upload_file():
    if 'projectId' in request.form:
        project_id = str(request.form['projectId'])
    else:
        response = {'message': 'No project id provided'}
        response = make_response(response)
        return response, 400

    # check the current user is allowed to uplaod data 
    project = get_project_by_id(project_id)
    collaborators = project.collaborators
    # get documents in a project
    docs = project.data
    collaborator = next((collaborator for collaborator in collaborators if collaborator.user.email == g.requestor_email), None)
    if (collaborator.role == UserRole.OWNER or collaborator.role == UserRole.ADMIN) is False:
        return user_unauthorised_response()

    if 'inputFile' not in request.files and 'encryptedData' not in request.form:
        response = {'message': 'No file selected'}
        return make_response(response), 400

    if 'inputFile' in request.files:
        file = request.files['inputFile']
        # Check file name
        if file.filename == '':
            response = {'message': 'No file selected'}
            return make_response(response), 400

        # Check file type
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() == "csv"):
            response = {'message': 'Incorrect filetype/format'}
            return make_response(response), 400

        filename = secure_filename(file.filename)
        filelocation = os.path.join(uploads_dir, filename)
        file.save(filelocation)

        # documents to import into the database
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

            # get documents in a project
            docs = project.data

            # get all ids in the database - import is adding more data into the database
            ids_in_db = []
            ids_incorrectly_formatted = []
            for doc in docs:

                ids_in_db.append(doc.display_id)

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
                            data_id = int(row[id_value_index])
                        except ValueError:
                            print("value exception throws")
                            if len(documents_to_import) > 0:
                                ids_incorrectly_formatted.append(row[id_value_index])
                                continue
                            else:
                                response = {'message': 'Incorrect filetype/format'}
                                break

                        # ID Uniqueness check
                        print("start checking ID uniqueness")
                        print(row[id_value_index])
                        print(ids_in_db)
                        if data_id in ids_in_db:
                            print("there is a conflicts in the id")
                            print(data_id)
                            conflicting_display_id_docs.append(data_id)
                        else:
                            print("creating a new document with id: " + str(data_id) + " and value: " + doc_value)
                            document = create_new_document(data_id, doc_value)
                            documents_to_import.append(document)
                            ids_in_db.append(data_id)
                    else:  # CASE 2: Generate display IDs
                        start_index = len(docs) - 1
                        id_counter = 1

                        new_id = start_index + id_counter
                        print("generate new id for the new doc")
                        print(new_id)
                        while new_id in ids_in_db:
                            new_id += 1
                            id_counter += 1

                        document = create_new_document(new_id, doc_value)
                        documents_to_import.append(document)
                        ids_in_db.append(new_id)
                        id_counter += 1

        # Delete file when done
        os.remove(filelocation)

    if 'encryptedData' in request.form:
        response = {'message': 'Documents imported successfully'}
        encryptedData = json.loads(request.form['encryptedData'])

        start_index = len(docs) - 1

        ids_in_db = []
        documents_to_import = []

        for doc_value in encryptedData:
            id_counter = 1
            new_id = start_index + id_counter
            while new_id in ids_in_db:
                new_id += 1
                id_counter += 1

            document = create_new_document(new_id, doc_value)
            documents_to_import.append(document)
            ids_in_db.append(new_id)
            id_counter += 1

    if response == {'message': 'Incorrect filetype/format'}:
        return make_response(response), 400
    else:
        # Insert docs
        if len(documents_to_import) > 0:
            add_documents_to_database(project, documents_to_import)
            return make_response(response), 200

        else:
            if len(conflicting_display_id_docs) > 0 and len(ids_incorrectly_formatted) > 0:
                response = {
                    'message': 'Documents with IDs already in system: ' + str(conflicting_display_id_docs) +
                               ' Documents with incorrectly formatted IDs ' + str(ids_incorrectly_formatted)}
            elif len(conflicting_display_id_docs) > 0:
                response = {
                    'message': 'Documents with IDs already in system: ' + str(conflicting_display_id_docs)}
            elif len(ids_incorrectly_formatted) > 0:
                response = {
                    'message': 'Documents with incorrectly formatted IDs: ' + str(ids_incorrectly_formatted)}

            # error response
            return make_response(response), 442


# Endpoint for exporting documents with labels for project
@import_export_api.route('/projects/<project_id>/export', methods=['GET'])
@check_token
def export_documents(project_id):
    requestor_email = g.requestor_email

    project = get_project_by_id(project_id)
    print(does_user_belong_to_a_project(requestor_email, project_id))

    if not does_user_belong_to_a_project(requestor_email, project_id) :
        return user_unauthorised_response()

    # get all documents and labels
    label_col = get_all_labels_of_a_project(project_id)
    documents = get_all_document_of_a_project(project_id)

    # Get contributors of project?
    users = get_all_users_associated_with_a_project(project_id)
    collaborators = list(filter(lambda collaborator: collaborator.role.value == 'owner' or collaborators.role.value == 'collaborator', project.collaborators))[0]

    docs_to_write = []
    # Generate data in correct format for export
    for d in documents:
        final_label = d.final_label
        doc_label_status = "INCOMPLETE"
        labels = d.labels

        num_contributors_labelled = len(d.labels)

        if final_label is not None:
            doc_label_status = "AGREED AND CONFIRMED"

        else:
            if num_contributors_labelled > 1:
                final_label = ""
                doc_label_status = "LABELLED BUT UNCONFIRMED"
            if num_contributors_labelled == 0:
                final_label = ""
                doc_label_status = "NO LABELLED YET"

        res = {'ID': d.display_id, 'DOCUMENT': d.value,
                              'LABEL': final_label, 'LABEL STATUS': doc_label_status}

        # make dictionary
        idx = 1
        for l in labels:
            str = l.user.username
            res[str] = l.label
        print(res)
        docs_to_write.append(res)
    docs = JSONEncoder().encode(docs_to_write)
    return docs, 200
