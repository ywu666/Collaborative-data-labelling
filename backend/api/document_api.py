import datetime
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
    col = get_col("New_Project", "documents")
    print(col.count_documents({}))
