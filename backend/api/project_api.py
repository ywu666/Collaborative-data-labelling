from flask import Blueprint, request, make_response

from mongoDBInterface import create_db_for_proj, get_col, get_db_client
from firebase_auth import get_email

project_api = Blueprint('project_api', __name__)


@project_api.route("/projects", methods=['POST'])
def create_project():
    if 'id_token' in request.json:
        id_token = request.json['id_token']

        requestor_email = get_email(id_token)
        if requestor_email is None:
            response = {'message': "ID Token has expired or is invalid"}
            response = make_response(response)
            return response, 400
    else:
        response = {'message': "Missing id_token"}
        response = make_response(response)
        return response, 400

    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'message': "Missing projectID"}
        response = make_response(response)
        return response, 400

    my_client = get_db_client()

    if project not in my_client.list_database_names():
        create_db_for_proj(project)
        project_user_col = get_col(project, "users")
        project_user_col.insert_one({'email': requestor_email, 'isAdmin': True, 'isContributor': True})
    else:
        response = {'message': "Project already exists"}
        response = make_response(response)
        return response, 400

    response = {'message': "Created project"}
    response = make_response(response)
    return response, 204


@project_api.route("/projects", methods=['GET'])
def get_projects():
    if 'id_token' in request.json:
        id_token = request.json['id_token']

        requestor_email = get_email(id_token)
        if requestor_email is None:
            response = {'message': "ID Token has expired or is invalid"}
            response = make_response(response)
            return response, 400
    else:
        response = {'message': "Missing id_token"}
        response = make_response(response)
        return response, 400

    all_users_col = get_col("users", "users")
    requestor = all_users_col.find_one({"email": requestor_email})

    if requestor is None:
        response = {'message': "Not authorised to perform this action"}
        response = make_response(response)
        return response, 401

    my_client = get_db_client()
    names = my_client.list_database_names()
    names.remove("admin")
    names.remove("local")
    names.remove("users")
    response = {'projects': names}
    response = make_response(response)
    return response, 200


@project_api.route("/project/delete", methods=['DELETE'])
def delete_project():
    if 'id_token' in request.json:
        id_token = request.json['id_token']

        requestor_email = get_email(id_token)
        if requestor_email is None:
            response = {'message': "ID Token has expired or is invalid"}
            response = make_response(response)
            return response, 400
    else:
        response = {'message': "Missing id_token"}
        response = make_response(response)
        return response, 400

    if 'project' in request.json:
        project = request.json['project']
        if project == "local" or project == "users" or project == "admin":
            response = {'message': "Cannot delete that project because it is not a user created project"}
            response = make_response(response)
            return response, 400
    else:
        response = {'message': "Missing projectID"}
        response = make_response(response)
        return response, 400

    user_col = get_col(project, "users")
    requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
    if requestor is None:
        response = {'message': "Not authorised for that operation"}
        response = make_response(response)
        return response, 403

    my_client = get_db_client()
    names = my_client.list_database_names()
    if project in names:
        my_client.drop_database(project)
    else:
        response = {'message': "Project does no exist"}
        response = make_response(response)
        return response, 400

    response = {'message': "Deleted project"}
    response = make_response(response)
    return response, 204


if __name__ == '__main__':
    my_client = get_db_client()
    print(my_client.list_database_names())