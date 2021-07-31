from flask.json import jsonify
from database.project_dao import get_document_of_a_project
from database.user_dao import does_user_belong_to_a_project, get_user_from_database_by_email
from middleware.auth import check_token
from api.validation_methods import user_unauthorised_response
from flask import Blueprint, request, make_response, g

document_label_api = Blueprint('document_label_api', __name__)

@document_label_api.route('/projects/<project_id>/unlabelled/documents', methods=['Get'])
@check_token
def get_unlabelled_document_ids(project_id):
    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    requestor_email = g.requestor_email
    userId = get_user_from_database_by_email(requestor_email).id

    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    data = get_document_of_a_project(project_id, page, page_size)
    docs = []
    # for each data, only look for label given by the current user
    for d in data:
        labelByUser = next((item for item in d.labels if item.user.id == userId), None)

        # append result if the current user did not label it 
        if not labelByUser:
            result = {
                'display_id': d.display_id,
                'label': None,
                'data': d.value
            }
            docs.append(result)

    result = {
        'docs': docs,
        'count': len(docs)
    }

    return jsonify(result), 200


# # Returns the ids of documents that have conflicting labels
# @document_label_api.route('/projects/<project_name>/conflicting/documents', methods=['Get'])
# def get_conflicting_labels_document_ids(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     try:
#         page = int(request.args.get('page'))
#         page_size = int(request.args.get('page_size'))
#     except (ValueError, TypeError):
#         response = {'message': "page and page_size must be integers"}
#         return make_response(response), 400

#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email})
#     if requestor is None:
#         return user_unauthorised_response()

#     conflicting_doc_ids = []

#     # get all documents
#     doc_col = get_db_collection(project_name, "documents")
#     documents = doc_col.find(projection={'comments': 0})

#     # Check if labels match
#     for d in documents:
#         # Find final label id
#         user_and_labels = d['user_and_labels']

#         if len(user_and_labels) > 1:
#             final_label_id = user_and_labels[0]['label']
#             for item in user_and_labels:
#                 # check that label is the same
#                 if item['label'] != final_label_id:
#                     conflicting_doc_ids.append(ObjectId(d['_id']))
#                     break

#     # get documents that conflict
#     query = {'_id': {'$in': conflicting_doc_ids}}
#     projection = {'_id': 1}
#     docs = doc_col.find(query, projection).skip(page * page_size).limit(page_size)

#     docs_dict = {'docs': list(docs)}
#     docs = JSONEncoder().encode(docs_dict)
#     return docs, 200


# This end point returns the IDs of documents for which the final label is not confirmed for the user calling the method
@document_label_api.route('/projects/<project_id>/unconfirmed/documents', methods=['Get'])
@check_token
def get_documents_with_unconfirmed_labels_for_user(project_id):
    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    requestor_email = g.requestor_email
    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    data = get_document_of_a_project(project_id, page, page_size)
    docs = []

    # for each data, only look for label given by the current user
    for d in data:
        # append result if the current user did not label it 
        if not d.final_label:
            result = {
                'display_id': d.display_id,
                'label': None,
                'data': d.value
            }
            docs.append(result)

    result = {
        'docs': docs,
        'count': len(docs)
    }
  
    return jsonify(result), 200


# @document_label_api.route('/projects/<project_name>/documents/<document_id>/label-is-confirmed', methods=['Get'])
# def get_if_document_label_confirmed_for_user(project_name, document_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     doc_col = get_db_collection(project_name, "documents")
#     doc = doc_col.find_one({'$and': [{'_id': ObjectId(document_id)},
#                                      {'user_and_labels.email': requestor_email}]})

#     if doc is None:
#         response = {'message': "User has not labelled this document"}
#         return make_response(response), 400

#     doc = doc_col.find_one({'$and': [{'_id': ObjectId(document_id)},
#                                      {'user_and_labels': {'$elemMatch': {'email': requestor_email,
#                                                                          'label_confirmed': True}}}]})
#     if doc:
#         response = \
#             {
#                 'email': requestor_email,
#                 'document': document_id,
#                 'labelIsConfirmed': True
#             }
#     else:
#         response = \
#             {
#                 'email': requestor_email,
#                 'document': document_id,
#                 'labelIsConfirmed': False
#             }

#     return make_response(response), 200


# # Endpoint to allow adding of labels to a document
# @document_label_api.route('/projects/<project_name>/documents/<document_id>/label', methods=['Post'])
# def set_label_for_user(project_name, document_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if 'label_id' in request.json:
#         label_id = request.json['label_id']
#     else:
#         response = {'message': "Missing label"}
#         return make_response(response), 400

#     # get user obj
#     user_col = get_db_collection(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     invalid_label = invalid_label_response(project_name, label_id)
#     if invalid_label is not None:
#         return invalid_label

#     col = get_db_collection(project_name, "documents")
#     document = col.find_one({'_id': ObjectId(document_id)})

#     # If labels are already the same, prevent any further changes
#     if check_all_labels_for_document_match(document):
#         response = {'message': "Label already confirmed"}
#         return make_response(response), 400

#     # Check if other contributor has labelled document
#     contributors_labelled = len(document['user_and_labels'])
#     labels_are_match = False
#     current_user_label = col.find_one(
#         {'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": requestor_email}}})

#     if contributors_labelled == 2 or (contributors_labelled == 1 and not current_user_label):
#         for item in document['user_and_labels']:
#             # If label assignments match, set confirmed
#             if item['email'] != requestor_email and item['label'] == ObjectId(label_id):
#                 labels_are_match = True

#                 # Update other contributor
#                 update_user_document_label(col, item['email'], document_id, label_id, labels_are_match)
#                 break

#     # if the label already exists for the user
#     if current_user_label is not None:
#         update_user_document_label(col, requestor_email, document_id, label_id, labels_are_match)
#     else:
#         # if the label assignment does not exist for the user
#         create_user_document_label(col, requestor_email, document_id, label_id, labels_are_match)

#     return '', 204


# @document_label_api.route('/projects/<project_name>/documents/<document_id>/label-confirmation', methods=['PUT'])
# def set_user_final_label(project_name, document_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     # get user obj
#     user_col = get_db_collection(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     if 'label_id' in request.json:
#         label_id = request.json['label_id']
#     else:
#         response = {'message': "Missing label"}
#         return make_response(response), 400

#     invalid_label = invalid_label_response(project_name, label_id)
#     if invalid_label is not None:
#         return invalid_label

#     doc_col = get_db_collection(project_name, "documents")
#     doc = doc_col.find_one({'_id': ObjectId(document_id)})
#     # check for doc existing
#     if doc is None:
#         response = {'message': "Invalid Document"}
#         return make_response(response), 400

#     # check that doc is fully labelled
#     if len(doc['user_and_labels']) < 2:
#         response = {'message': "Not all contributors have finished labelling documents!"}
#         return make_response(response), 400

#     # check for document final label not confirmed
#     if check_all_labels_for_document_match(doc):
#         response = {'message': "Final Label already confirmed!"}
#         return make_response(response), 400

#     # Confirm user's label
#     labels_are_match = False
#     for item in doc['user_and_labels']:
#         # If label assignments match, set confirmed
#         if item['email'] != requestor_email and item['label'] == ObjectId(label_id):
#             labels_are_match = True

#             # Update other contributor
#             update_user_document_label(doc_col, item['email'], document_id, label_id, labels_are_match)
#             break

#     if labels_are_match:
#         update_user_document_label(doc_col, requestor_email, document_id, label_id, True)
#     else:
#         doc_col.update_one({'_id': ObjectId(document_id),
#                             "user_and_labels": {'$elemMatch': {"email": requestor_email}}},
#                            {'$set': {
#                                "user_and_labels.$.label": ObjectId(label_id),
#                                "user_and_labels.$.label_confirmed": True}
#                            })

#     doc = doc_col.find_one({'_id': ObjectId(document_id)})

#     response = generate_response_for_getting_document_final_label_and_conflict_status(doc, document_id)

#     return response, 200
