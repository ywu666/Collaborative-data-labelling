import firebase_admin
from flask import Blueprint, request, make_response

from api.methods import JSONEncoder
from firebase_auth import get_email
from mongoDBInterface import get_col

user_api = Blueprint('user_api', __name__)


@user_api.route("/user/create", methods=["Post"])
def create_user():
    # creates a new user based on the ID token that gets sent over
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


    all_users = get_col("users", "users")

    if all_users.find_one({'email': requestor_email}) is not None:
        response = {'message': "User already exists"}
        response = make_response(response)
        return response, 400

    all_users.insert_one({'email': requestor_email, 'projects': []}) # projects should just include the project IDs which the user
    # is part of! When a new user is created it should be empty

    return "", 204


@user_api.route("/user/project/add", methods=["Post"])
# Adding a new user to a project
def add_user_to_project():
    # inputs: id_token of requestor, project name, email of user to be added to project
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
        response = {'message': "Missing project"}
        response = make_response(response)
        return response, 400
    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        response = make_response(response)
        return response, 400

    # check if the new user is already in the "users" collection in the "users" database
    user_to_add = get_col("users", "users").find_one({'email': email})

    if user_to_add is None:
        response = {'message': "User does not exist/does not have an account"}
        response = make_response(response)
        return response, 400

    project_user_col = get_col(project, "users")
    if project_user_col.find_one({'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
        response = {'message': "Not authorised to perform this action"}
        response = make_response(response)
        return response, 401

    if not project_user_col.find_one({'email': requestor_email})['isAdmin']:  # if the requestor is not an admin, return forbidden
        response = {'message': "Forbidden to perform this action"}
        response = make_response(response)
        return response, 403

    if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
        project_user_col.insert_one({'email': email, 'isAdmin': False, 'isContributor': False})
        return "", 204
    else:
        response = {'message': "That user is already in the provided project"}
        response = make_response(response)
        return response, 400


@user_api.route("/user/project/update", methods=["Put"])
# Updating user permissions in a particular project
def update_user():
    # inputs: id_token of requestor, project name, email of user to be changed, and changes to be applied
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
        response = {'message': "Missing project"}
        response = make_response(response)
        return response, 400
    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        response = make_response(response)
        return response, 400
    if 'permissions' in request.json:
        permissions = request.json['permissions']
    else:
        response = {'message': "Missing permissions"}
        response = make_response(response)
        return response, 400

    project_user_col = get_col(project, "users")
    if project_user_col.find_one({'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
        response = {'message': "Not authorised to perform this action"}
        response = make_response(response)
        return response, 401

    if not project_user_col.find_one({'email': requestor_email})['isAdmin']:  # if the requestor is not an admin, return forbidden
        response = {'message': "Forbidden to perform this action"}
        response = make_response(response)
        return response, 403

    if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
        response = {'message': "That user does not exist in the project, add them to the project first"}
        response = make_response(response)
        return response, 400

    project_user_col.update_one({'email': email}, {'$set': permissions})
    return "", 204


@user_api.route("/user/all", methods=["Get"])
# Gets all user emails within any database
def get_user_emails():
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

    users_col = get_col("users", "users")
    all_users = users_col.find({}, {'email': 1})
    all_users_dict = {"users": list(all_users)}
    all_users_json = JSONEncoder().encode(all_users_dict)
    return all_users_json, 200


@user_api.route("/user/project/all", methods=["Get"])
def get_user_infos_for_project():
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
        response = {'message': "Missing project"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project, "users")

    if users_col.find_one({'email': requestor_email}) is None:
        response = {'message': "Not allowed to perform this action unless you are part of the project"}
        response = make_response(response)
        return response, 403

    all_users = users_col.find({})
    all_users_dict = {"users": list(all_users)}
    all_users_json = JSONEncoder().encode(all_users_dict)
    return all_users_json, 200


@user_api.route("/user", methods=["Get"])
def get_user_info():
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

    users_col = get_col("users", "users")
    user_dict = users_col.find_one({"email": requestor_email})
    user_json = JSONEncoder().encode(user_dict)
    return user_json, 200


@user_api.route("/user/delete", methods=["Delete"])
# requestor can remove themself
def remove_user():
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

    get_col("users", "users").delete_one({"email": requestor_email})
    return "", 204


@user_api.route("/user/project/delete", methods=["Delete"])
# admin or requestor can remove
def remove_user_from_project():
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
        response = {'message': "Missing project"}
        response = make_response(response)
        return response, 400
    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project, requestor_email)
    requestor = users_col.find_one({'email': requestor_email})

    if requestor_email == email or requestor['isAdmin']:  # if you want to delete yourself, or are an admin, can delete others
        users_col.delete_one({'email': email})
    return "", 204
