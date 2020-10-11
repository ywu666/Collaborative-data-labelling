from api.methods import JSONEncoder
from api.validation_methods import check_id_token, user_unauthorised_response
from bson import ObjectId
from firebase_auth import get_email
from flask import Blueprint, request, make_response
from model.document import get_db_collection
from mongoDBInterface import get_col

label_api = Blueprint('label_api', __name__)


@label_api.route('/projects/<project_name>/labels/add', methods=['Post'])
def add_preset_labels(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        return user_unauthorised_response()

    if 'label_name' in request.json:
        label_name = request.json['label_name']
    else:
        response = {'message': "Missing label to add"}
        return make_response(response), 400

    labels_col = get_col(project_name, "labels")
    label_in_database = labels_col.find_one({"name": label_name})

    if label_in_database is not None:
        response = {'message': "That label already exists"}
        return make_response(response), 400

    labels_col.insert_one({"name": label_name})
    return "", 204


@label_api.route('/projects/<project_name>/labels/all', methods=['Get'])
def get_preset_labels(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email})
    if requestor is None:
        return user_unauthorised_response()

    labels_col = get_col(project_name, "labels")
    labels = labels_col.find({})
    labels_list = list(labels)
    labels_dict = {
        'labels': labels_list
    }
    labels_out = JSONEncoder().encode(labels_dict)
    return labels_out, 200


@label_api.route('/projects/<project_name>/labels/<label_id>/delete', methods=['Delete'])
def delete_preset_labels(project_name, label_id):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        return user_unauthorised_response()

    labels_col = get_col(project_name, "labels")
    labels_col.delete_one({"_id": ObjectId(label_id)})
    # Go into each document, and delete all mentions of that label from each document
    document_col = get_col(project_name, "documents")
    document_col.update(
        {
            "user_and_labels": {
                "$elemMatch": {
                    "label": ObjectId(label_id)
                }
            }
        },
        {
            "$pull": {
                "user_and_labels": {
                    'label': ObjectId(label_id)}
            }
        })

    return "", 204


@label_api.route('/projects/<project_name>/labels/<label_id>/update', methods=['Put'])
def update_preset_labels(project_name, label_id):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        return user_unauthorised_response()

    if 'label_name' in request.json:
        label_name = request.json['label_name']
    else:
        response = {'message': "Missing label to add"}
        return make_response(response), 400

    labels_col = get_col(project_name, "labels")
    labels_col.update_one({"_id": ObjectId(label_id)}, {'$set': {'name': label_name}})
    return "", 204
