from bson import ObjectId
from flask import Blueprint, request, make_response

from api.methods import JSONEncoder
from model.document import Document, get_db_collection
from model.label import Label
from mongoDBInterface import get_col

document_api = Blueprint('document_api', __name__)


@document_api.route('/projects/<project_name>/documents', methods=['Post'])
# Creating a new document!
def create_document(project_name):
    if 'content' in request.json:
        content = request.json['content']
    else:
        response = {'message': "Missing content"}
        response = make_response(response)
        return response, 400

    doc = Document(content, [], [])
    doc.data = content
    doc.upload(project)
    return '', 204


@document_api.route('/projects/<project_name>/documents', methods=['Get'])
def get_document_ids(project_name):
    col = get_db_collection(project_name, "documents")
    docs = col.find({}, {'_id': 1})
    docs = list(docs)
    docs = JSONEncoder().encode(docs)
    return {"document_ids": docs}, 200


@document_api.route('/projects/<project_name>/documents/<document_id>', methods=['Get'])
# Getting a document!
def get_document(project_name, document_id):
    col = get_db_collection(project_name, "documents")
    doc = col.find_one({'_id': ObjectId(document_id)}, {'_id': 0})
    doc = JSONEncoder().encode(doc)
    response = {'document': doc}
    response = make_response(response)
    return response, 200


# Endpoint to allow adding of labels to a document
@document_api.route('/projects/<project_name>/documents/<document_id>/label', methods=['Post'])
def set_label_for_user(project_name, document_id):
    if 'email' in request.json:
        email = request.json['email']
    else:
        response = {'message': "Missing email"}
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
    user = user_col.find_one({'email': email})
    if user is None:
        response = {'message': "Invalid User Email"}
        response = make_response(response)
        return response, 400

    # get label obj
    label_col = get_db_collection(project_name, "labels")
    label = label_col.find_one({'_id': ObjectId(label_id)})
    if label is None:
        response = {'message': "Invalid Label"}
        response = make_response(response)
        return response, 400

    col = get_db_collection(project, "documents")

    # if the label already exists for the user
    if col.find_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": email}}}) is not None:
        col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": email}}},
                       {'$set': {
                           "user_and_labels.$.label": ObjectId(label_id)}
                       })
    else:
        # if the label assignment does not exist for the user
        col.update_one({'_id': ObjectId(document_id)},
                       {'$push': {
                           "user_and_labels": {
                               "email": email,
                               "label": ObjectId(label_id)}
                           }
                       })

    return '', 204


if __name__ == '__main__':
    project = "New_Project"
    col = get_db_collection(project, "documents")
    docs = col.find({}, {'_id': 1})
    for d in docs:
        print(d)



