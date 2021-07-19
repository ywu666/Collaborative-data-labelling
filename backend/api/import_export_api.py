from middleware.auth import check_token
from enums.user_role import UserRole
from database.project_dao import get_project_by_id, add_documents_to_database, create_new_document
import csv
import os

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
    print("upload files endpoint called")

    if 'projectId' in request.form:
        project_id = str(request.form['projectId'])
    else:
        response = {'message': 'No project id provided'}
        response = make_response(response)
        return response, 400

    # check the current user is allowed to uplaod data 
    project = get_project_by_id(project_id)
    collaborators = project.collaborators
    collaborator = next((collaborator for collaborator in collaborators if collaborator.user.email == g.requestor_email), None)
    if (collaborator.role == UserRole.OWNER or collaborator.role == UserRole.ADMIN) is False:
        return user_unauthorised_response()

    if 'inputFile' not in request.files:
        response = {'message': 'No file selected'}
        return make_response(response), 400

    file = request.files['inputFile']
    # Check file name
    if file.filename == '':
        response = {'message': 'No file selected'}
        return make_response(response), 400

    # Check file type
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() == "csv"):
        response = {'message': 'Incorrect filetype/format'}
        return make_response(response), 400

    if file:
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
            print("getting all current ids in the database")
            ids_in_db = []
            ids_incorrectly_formatted = []
            for doc in docs:
                print("id currently in the database")
                print(doc.display_id)
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
                            print("creating a new document with id: " + data_id + " and value: " + doc_value)
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

        if response == {'message': 'Incorrect filetype/format'}:
            return make_response(response), 400
        else:
            # Insert docs
            if len(documents_to_import) > 0:
                print("about to insert data to the database")
                add_documents_to_database(project, documents_to_import)
                return make_response(response), 200 

            else:
                if len(conflicting_display_id_docs) > 0 and len(ids_incorrectly_formatted) > 0:
                    response = { 'message': 'Documents with IDs already in system: ' + str(conflicting_display_id_docs) +
                                 ' Documents with incorrectly formatted IDs ' +  str(ids_incorrectly_formatted)}
                elif len(conflicting_display_id_docs) > 0:
                    response = {'message': 'Documents with IDs already in system: ' + str(conflicting_display_id_docs)}
                elif len(ids_incorrectly_formatted) > 0:
                    response = {'message': 'Documents with incorrectly formatted IDs: ' + str(ids_incorrectly_formatted)}

                # error response
                return make_response(response), 442


# # Endpoint for exporting documents with labels for project
# @import_export_api.route('/projects/<project_name>/export', methods=['GET'])
# def export_documents(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     user_col = get_col(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})

#     if requestor is None:
#         return user_unauthorised_response()

#     # get all documents and labels
#     label_col = get_db_collection(project_name, 'labels')
#     doc_col = get_db_collection(project_name, "documents")
#     documents = doc_col.find(projection={'comments': 0})

#     # Get contributors of project?
#     user_col = get_db_collection(project_name, "users")
#     contributor_emails = user_col.find({'isContributor': True}, {'_id': 0, 'email': 1})
#     if len(list(contributor_emails)) == 2:
#         contributor_one_index = 0
#         contributor_two_index = 1
#     elif len(list(contributor_emails)) == 1:
#         contributor_one_index = 0

#     docs_to_write = []
#     # Generate data in correct format for export
#     for d in documents:
#         final_label_id = d['final_label']
#         doc_label_status = "INCOMPLETE"

#         num_contributors_labelled = len(d['user_and_labels'])
#         contributor_one_label = ""
#         contributor_two_label = ""

#         if final_label_id is not None:
#             final_label = get_label_name_by_label_id(label_col, final_label_id)
#             doc_label_status = "AGREED AND CONFIRMED"

#             contributor_one_label = get_label_name_by_label_id(label_col,
#                                                                d['user_and_labels'][contributor_one_index]['label'])
#             contributor_two_label = contributor_one_label
#         elif num_contributors_labelled == 2:
#             if d['user_and_labels'][contributor_one_index]['label_confirmed'] and \
#                     d['user_and_labels'][contributor_two_index]['label_confirmed']:
#                 final_label = "DOCUMENT REDACTED"
#                 doc_label_status = "NO AGREEMENT AND CONFIRMED"
#             else:
#                 final_label = ""
#                 doc_label_status = "LABELLED BUT UNCONFIRMED"

#             contributor_one_label = get_label_name_by_label_id(label_col,
#                                                                d['user_and_labels'][contributor_one_index]['label'])
#             contributor_two_label = get_label_name_by_label_id(label_col,
#                                                                d['user_and_labels'][contributor_two_index]['label'])
#         else:
#             final_label = ""
#             if num_contributors_labelled == 1:
#                 # Handle ordering of contributors if there is only one contributor
#                 contributor_one_label = get_label_name_by_label_id(label_col,
#                                                                    d['user_and_labels'][contributor_one_index]['label'])

#         # make dictionary
#         docs_to_write.append({'ID': d['display_id'], 'DOCUMENT': d['data'],
#                               'LABEL': final_label, 'LABEL STATUS': doc_label_status,
#                               'CONTRIBUTOR 1 LABEL': contributor_one_label,
#                               'CONTRIBUTOR 2 LABEL': contributor_two_label})
#     docs = JSONEncoder().encode(docs_to_write)
#     return docs, 200
