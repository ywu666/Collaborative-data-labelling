from bson import ObjectId
from flask import Blueprint, request, make_response

from api.methods import JSONEncoder
from firebase_auth import get_email
from model.document import get_db_collection
from model.project import Project
from mongoDBInterface import get_col

label_api = Blueprint('label_api', __name__)


@label_api.route('/projects/<project_name>/labels/add', methods=['Post'])
def add_preset_labels(project_name):
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

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    if 'label_name' in request.json:
        label_name = request.json['label_name']
    else:
        response = {'message': "Missing label to add"}
        response = make_response(response)
        return response, 400

    labels_col = get_col(project_name, "labels")
    label_in_database = labels_col.find_one({"name": label_name})

    if label_in_database is not None:
        response = {'message': "That label already exists"}
        response = make_response(response)
        return response, 400

    labels_col.insert_one({"name": label_name})
    return "", 204


@label_api.route('/projects/<project_name>/labels/all', methods=['Get'])
def get_preset_labels(project_name):
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

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    labels_col = get_col(project_name, "labels")
    labels = labels_col.find({})
    labels = JSONEncoder().encode(labels)
    response = {"labels": labels}
    response = make_response(response)
    return response, 200


@label_api.route('/projects/<project_name>/labels/<label_id>', methods=['Post'])
def delete_preset_labels(project_name, label_id):
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

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    labels_col = get_col(project_name, "labels")
    labels_col.delete_one({"_id": ObjectId(label_id)})
    return "", 204


@label_api.route('/projects/<project_name>/labels/<label_id>/update', methods=['Put'])
def update_preset_labels(project_name, label_id):
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

    user_col = get_db_collection(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    if 'label_name' in request.json:
        label_name = request.json['label_name']
    else:
        response = {'message': "Missing label to add"}
        response = make_response(response)
        return response, 400

    labels_col = get_col(project_name, "labels")
    labels_col.update_one({"_id": ObjectId(label_id)}, {'$set': {'name': label_name}})
    return "", 204



