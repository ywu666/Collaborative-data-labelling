from api.validation_methods import check_id_token
from flask import Blueprint, request, make_response
import re
from api.methods import add_project_to_user, remove_project_from_user
from mongoDBInterface import create_db_for_proj, get_col, get_db_client
from firebase_auth import get_email

project_api = Blueprint('project_api', __name__)


@project_api.route("/projects/create", methods=['POST'])
def create_project():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    if 'project_name' in request.json:
        project = request.json['project_name']
    else:
        response = {'message': "Missing project name"}
        response = make_response(response)
        return response, 400

    my_client = get_db_client()
    if not re.match(r'^\w+$', project):
        response = {'message': "Project name can only be Alphanumerics and underscores"}
        response = make_response(response)
        return response, 400

    if project not in my_client.list_database_names():
        create_db_for_proj(project)
        project_user_col = get_col(project, "users")
        project_user_col.insert_one({'email': requestor_email, 'isAdmin': True, 'isContributor': True})
        add_project_to_user(requestor_email, project)
    else:
        response = {'message': "Project already exists"}
        response = make_response(response)
        return response, 400

    return "", 204


@project_api.route("/projects/all", methods=['GET'])
def get_projects():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    all_users_col = get_col("users", "users")
    requestor = all_users_col.find_one({"email": requestor_email})

    if requestor is None:
        response = {'message': "Not authorised to perform this action"}
        response = make_response(response)
        return response, 401

    users_col = get_col("users", "users")
    requestor = users_col.find_one({'email': requestor_email})
    names = requestor['projects']
    response = {'projects': names}
    response = make_response(response)
    return response, 200


@project_api.route("/projects/<project_name>/delete", methods=['DELETE'])
def delete_project(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    if project_name == "local" or project_name == "users" or project_name == "admin":
        response = {'message': "Cannot delete that project because it is not a user created project"}
        response = make_response(response)
        return response, 400

    user_col = get_col(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "Not authorised for that operation"}
        response = make_response(response)
        return response, 403

    my_client = get_db_client()
    names = my_client.list_database_names()
    if project_name in names:
        all_users = user_col.find({})
        for user in all_users:
            user_email = user['email']
            remove_project_from_user(user_email, project_name)
        my_client.drop_database(project_name)
    else:
        response = {'message': "Project does not exist"}
        response = make_response(response)
        return response, 400

    return "", 204


@project_api.route('/projects/<project_name>/agreement_score', methods=['GET'])
def get_agreement_score(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    user_col = get_col(project_name, "users")
    requestor = user_col.find_one({'email': requestor_email})
    if requestor is None:
        response = {'message': "You are not authorised to perform this action"}
        response = make_response(response)
        return response, 403

    doc_col = get_col(project_name, "documents")

    all_docs = doc_col.find({})
    agreed = 0
    not_agreed = 0
    for doc in all_docs:
        if len(doc['user_and_labels']) == 2:
            label_1 = doc['user_and_labels'][0]['label']
            label_2 = doc['user_and_labels'][1]['label']
            if label_1 == label_2:
                agreed = agreed + 1
            else:
                not_agreed = not_agreed + 1

    analysed = agreed + not_agreed

    return_dict = {
        "agreed_number": agreed,
        "not_agreed_number": not_agreed,
        "analysed_number": analysed,
        "total_number": doc_col.count_documents({})
    }

    return return_dict, 200
