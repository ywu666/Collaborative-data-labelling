from api.methods import JSONEncoder
from bson import ObjectId
from firebase_auth import get_email
from flask import Blueprint, request, make_response
from model.document import Document, get_db_collection
from mongoDBInterface import get_col

document_api = Blueprint('document_api', __name__)


@document_api.route('/projects/<project_name>/documents', methods=['Post'])
# Creating a new document!
def create_document(project_name):
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

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    if 'content' in request.json:
        content = request.json['content']
    else:
        response = {'message': "Missing content"}
        response = make_response(response)
        return response, 400

    doc = Document(content, [], [])
    doc.data = content
    doc.upload(project_name)
    return '', 204


@document_api.route('/projects/<project_name>/documents', methods=['Get'])
def get_document_ids(project_name):
    id_token = request.args.get('id_token')

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        response = make_response(response)
        return response, 400

    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}
        response = make_response(response)
        return response, 400

    requestor_email = get_email(id_token)

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    col = get_db_collection(project_name, "documents")
    count = col.find({}).count()
    docs = col.find({}).skip(page * page_size).limit(page_size)
    docs_dict = {'docs': list(docs),
                 'count': count}
    docs = JSONEncoder().encode(docs_dict)
    return docs, 200


@document_api.route('/projects/<project_name>/documents/<document_id>', methods=['Get'])
# Getting a document!
def get_document(project_name, document_id):
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

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    col = get_db_collection(project_name, "documents")
    doc = col.find_one({'_id': ObjectId(document_id)}, {'_id': 0})

    doc = {'document': doc}
    doc = JSONEncoder().encode(doc)
    return doc, 200


@document_api.route('/projects/<project_name>/documents/<document_id>/delete', methods=['Get'])
# Getting a document!
def delete_document(project_name, document_id):
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

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    col = get_db_collection(project_name, "documents")
    col.delete_one({'_id': ObjectId(document_id)})
    return "", 204


# Endpoint to allow adding of labels to a document
@document_api.route('/projects/<project_name>/documents/<document_id>/label', methods=['Post'])
def set_label_for_user(project_name, document_id):
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

    if 'label_id' in request.json:
        label_id = request.json['label_id']
    else:
        response = {'message': "Missing label"}
        response = make_response(response)
        return response, 400

    # get user obj
    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    # get label obj
    label_col = get_db_collection(project_name, "labels")
    label = label_col.find_one({'_id': ObjectId(label_id)})
    if label is None:
        response = {'message': "Invalid Label"}
        response = make_response(response)
        return response, 400

    col = get_db_collection(project_name, "documents")
    document = col.find_one({'_id': ObjectId(document_id)})

    # If labels are already the same, prevent any further changes
    if document['label_confirmed']:
        response = {'message': "Label already confirmed"}
        response = make_response(response)
        return response, 400

    # Check if other contributor has labelled document
    label_is_confirmed = False
    if len(document['user_and_labels']) > 1:
        for item in document['user_and_labels']:
            # If label assignments match, set confirmed
            if item['email'] != requestor_email and item['label'] == ObjectId(label_id):
                label_is_confirmed = True

    current_user_label = col.find_one(
        {'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": requestor_email}}})
    # if the label already exists for the user
    if current_user_label is not None:

        col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": requestor_email}}},
                       {'$set': {
                           "user_and_labels.$.label": ObjectId(label_id),
                           "label_confirmed": label_is_confirmed}
                       })
    else:
        # if the label assignment does not exist for the user
        col.update_one({'_id': ObjectId(document_id)},
                       {'$push': {
                           "user_and_labels": {
                               "email": requestor_email,
                               "label": ObjectId(label_id)},
                       },
                           '$set': {"label_confirmed": label_is_confirmed}
                       })

    return '', 204


@document_api.route('/projects/<project_name>/documents/<document_id>/label-agreement', methods=['POST'])
def set_final_label_after_agreement(project_name, document_id):
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

    # get user obj
    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isContributor': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    if 'label_id' in request.json:
        label_id = request.json['label_id']
    else:
        response = {'message': "Missing label"}
        response = make_response(response)
        return response, 400

    label_col = get_db_collection(project_name, "labels")
    label = label_col.find_one({'_id': ObjectId(label_id)})
    if label is None:
        response = {'message': "Invalid Label"}
        response = make_response(response)
        return response, 400

    doc_col = get_db_collection(project_name, "documents")
    doc = doc_col.find_one({'_id': ObjectId(document_id)})
    # check for doc existing
    if doc is None:
        response = {'message': "Invalid Document"}
        response = make_response(response)
        return response, 400

    # check that doc is fully labelled
    if len(doc['user_and_labels']) < 2:
        response = {'message': "Labelling for document incomplete!"}
        response = make_response(response)
        return response, 400

    # check for labelling confirmed
    if doc['label_confirmed']:
        response = {'message': "Label already confirmed!"}
        response = make_response(response)
        return response, 400

    # Confirm label is final and set labels for users
    for user_label in doc['user_and_labels']:
        doc_col.update_one({'_id': ObjectId(document_id),
                            "user_and_labels": {'$elemMatch': {"email": user_label['email']}}},
                           {'$set': {
                               "user_and_labels.$.label": ObjectId(label_id),
                               "label_confirmed": True}
                           })

    return '', 200


@document_api.route('/projects/<project_name>/unlabelled/documents', methods=['Get'])
def get_unlabelled_document_ids(project_name):
    id_token = request.args.get('id_token')

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        response = make_response(response)
        return response, 400

    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}
        response = make_response(response)
        return response, 400

    requestor_email = get_email(id_token)

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    col = get_db_collection(project_name, "documents")
    docs = col.find({"user_and_labels": {'$not': {'$elemMatch': {"email": requestor_email}}}}, {'_id': 1}).skip(
        page * page_size).limit(page_size)
    docs_dict = {'docs': list(docs)}
    docs = JSONEncoder().encode(docs_dict)
    return docs, 200


# Returns the ids of documents that have conflicting labels
@document_api.route('/projects/<project_name>/conflicting/documents', methods=['Get'])
def get_conflicting_labels_document_ids(project_name):
    id_token = request.args.get('id_token')

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        response = make_response(response)
        return response, 400

    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}
        response = make_response(response)
        return response, 400

    requestor_email = get_email(id_token)

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    conflicting_doc_ids = []

    # get all documents
    doc_col = get_db_collection(project_name, "documents")
    documents = doc_col.find(projection={'comments': 0})

    # Check if labels match
    for d in documents:
        # Find final label id
        user_and_labels = d['user_and_labels']

        if len(user_and_labels) > 1:
            final_label_id = user_and_labels[0]['label']
            for item in user_and_labels:
                # check that label is the same
                if item['label'] != final_label_id:
                    conflicting_doc_ids.append(ObjectId(d['_id']))
                    break

    # get documents that conflict
    query = {'_id': {'$in': conflicting_doc_ids}}
    projection = {'_id': 1}
    docs = doc_col.find(query, projection).skip(page * page_size).limit(page_size)

    docs_dict = {'docs': list(docs)}
    docs = JSONEncoder().encode(docs_dict)
    return docs, 200


if __name__ == '__main__':
    int('a')
