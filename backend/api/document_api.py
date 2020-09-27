import datetime

from bson import ObjectId
from flask import Blueprint, request, make_response

from api.methods import JSONEncoder
from firebase_auth import get_email
from model.document import Document, get_db_collection
from model.label import Label
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
    count = col.count_documents({})
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

    # if the label already exists for the user
    if col.find_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": requestor_email}}}) is not None:
        col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": requestor_email}}},
                       {'$set': {
                           "user_and_labels.$.label": ObjectId(label_id)}
                       })
    else:
        # if the label assignment does not exist for the user
        col.update_one({'_id': ObjectId(document_id)},
                       {'$push': {
                           "user_and_labels": {
                               "email": requestor_email,
                               "label": ObjectId(label_id)}
                           }
                       })

    return '', 204


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
    docs = col.find({"user_and_labels": {'$not': {'$elemMatch': {"email": requestor_email}}}}, {'_id': 1}).skip(page * page_size).limit(page_size)
    docs_dict = {'docs': list(docs)}
    docs = JSONEncoder().encode(docs_dict)
    return docs, 200


@document_api.route('/projects/<project_name>/documents/<document_id>/comments/post', methods=['Post'])
def post_comment_on_document(project_name, document_id):
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

    if 'comment' in request.json:
        comment = request.json['comment']
    else:
        response = {'message': "Missing comment"}
        response = make_response(response)
        return response, 400

    # have to be contributor, should include email, time and content of comment for every comment
    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
    if requestor is None:
        response = {'message': "You are not authorised to do this"}
        response = make_response(response)
        return response, 403

    documents_col = get_col(project_name, "documents")
    current_time = datetime.datetime.now()
    documents_col.update_one({'_id': ObjectId(document_id)},
                             {'$push': {
                                 'comments': {
                                     'email': requestor_email,
                                     'comment_body': comment,
                                     'time': str(current_time)
                                 }
                             }})
    return '', 204


if __name__ == '__main__':
    int('a')



