from os import terminal_size
from enums.user_role import UserRole
from database.project_dao import get_all_users_associated_with_a_project, get_users_associated_with_a_project
from middleware.auth import check_token
# from api.methods import JSONEncoder, add_project_to_user, remove_project_from_user, remove_all_labels_of_user
from flask import Blueprint, request, make_response, jsonify, g
# from mongoDBInterface import get_col
from database.user_dao import get_user_from_database_by_email, get_user_from_database_by_username, save_user_and_keys, \
    get_all_user_email_from_database, does_user_belong_to_a_project
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

user_api = Blueprint('user_api', __name__)

'''
get information of a single user
request format: /users?email=email
FIXME email is also passed in as parameter, I don't quite understand why we allow users to get information of another user, maybe we need to change it. But requires 
analysing of frontend first 
'''


@user_api.route("/users", methods=["GET"])
@check_token
def get_user_info_from_email():
    email = request.args.get('email')
    if email is None or email == "":
        response = {'message': "Email is not included with the request uri in args"}
        return make_response(response), 400

    user_to_add = get_user_from_database_by_email(email)
    if user_to_add is None:
        response = {'message': "User does not exist/does not have an account"}
        return make_response(response), 400
    user_to_add = jsonify(user_to_add)
    return user_to_add, 200


'''
get emails of all users
FIXME why is this even needed?????
'''


@user_api.route("/user/all", methods=['Get'])
@check_token
def get_all_users_emails():
    all_user_emails = get_all_user_email_from_database()
    return jsonify(all_user_emails), 200

# return the role of the current user on a specific project
@user_api.route("/projects/<project_id>/user", methods=["Get"])
@check_token
def get_current_user_for_proj(project_id):
    collaborators = get_all_users_associated_with_a_project(project_id)
    collaborator = next((collaborator for collaborator in collaborators if collaborator.user.email == g.requestor_email), None)
    user = {
        '_id': str(collaborator.user.id),
        # a user had admin rights if he is the owner or a admin
        'isAdmin': True if collaborator.role == UserRole.OWNER else False,
        'isContributor': True if collaborator.role == UserRole.COLLABORATOR else False
    }

    return jsonify(user), 200


@user_api.route("/projects/<project_id>/users", methods=["Get"])
@check_token
def get_user_infos_for_project(project_id):
    requestor_email = g.requestor_email

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    if does_user_belong_to_a_project(requestor_email, project_id) is False:
        response = {'message': "Not allowed to perform this action unless you are part of the project"}
        response = make_response(response)
        return response, 403

    collaborators = get_users_associated_with_a_project(project_id, page, page_size)
    users = []
    for collaborator in collaborators:
        user = collaborator.user
        dict = {
            '_id': str(user.id),
            'email': user.email,
            'role': collaborator.role.name
        }
        users.append(dict)
    return jsonify(users), 200


# @user_api.route("/user", methods=["Get"])
# def get_user_info():
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     users_col = get_col("users", "users")
#     user_dict = users_col.find_one({"email": requestor_email})
#     user_json = JSONEncoder().encode(user_dict)
#     return user_json, 200

"""
called when a new user signup, it creates a new user in the database 
expected request format:
body: 
{
    username: username
}
"""


@user_api.route("/users/create", methods=["Post"])
@check_token
def create_user():
    requestor_email = g.requestor_email
    requestor_email = request.json["email"]
    db_user = get_user_from_database_by_email(requestor_email)

    if db_user is not None:
        response = {'message': "User already exists"}
        return make_response(response), 400

    if 'username' in request.json:
        username = request.json['username']

        db_user = get_user_from_database_by_username(username)
        if db_user is not None:
            response = {'message': "Username is already taken"}
            return make_response(response), 400
        else:
            user_keys = request.json['keys']

            print(user_keys)
            user = {
                "username": username,
                "email": requestor_email
            }

            save_user_and_keys(user, user_keys)
    else:
        response = {'message': "Missing username"}
        return make_response(response), 400

    # a new user created, the en_private_key is returned to the frontend
    return '', 204

# @user_api.route("/projects/<project_name>/users/add", methods=["Post"])
# # Adding a new user to a project
# def add_user_to_project(project_name):
#     # inputs: id_token of requestor, project name, email of user to be added to project
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if 'user' in request.json:
#         email = request.json['user']
#     else:
#         response = {'message': "Missing user"}
#         return make_response(response), 400

#     # check if the new user is already in the "users" collection in the "users" database
#     user_to_add = get_col("users", "users").find_one({'email': email})

#     if user_to_add is None:
#         response = {'message': "User does not exist/does not have an account"}
#         return make_response(response), 400

#     project_user_col = get_col(project_name, "users")
#     if project_user_col.find_one(
#             {'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
#         response = {'message': "Not authorised to perform this action"}
#         return make_response(response), 401

#     if not project_user_col.find_one({'email': requestor_email})[
#         'isAdmin']:  # if the requestor is not an admin, return forbidden
#         response = {'message': "Forbidden to perform this action"}
#         return make_response(response), 403

#     if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
#         project_user_col.insert_one({'email': email, 'isAdmin': False, 'isContributor': False})
#         add_project_to_user(email, project_name)
#         return "", 204
#     else:
#         response = {'message': "That user is already in the provided project"}
#         return make_response(response), 400


# @user_api.route("/projects/<project_name>/users/update", methods=["Put"])
# # Updating user permissions in a particular project
# def update_user(project_name):
#     # inputs: id_token of requestor, project name, email of user to be changed, and changes to be applied
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if 'user' in request.json:
#         email = request.json['user']
#     else:
#         response = {'message': "Missing user"}
#         return make_response(response), 400
#     if 'permissions' in request.json:
#         permissions = request.json['permissions']
#     else:
#         response = {'message': "Missing permissions"}
#         return make_response(response), 400

#     project_user_col = get_col(project_name, "users")
#     if project_user_col.find_one(
#             {'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
#         response = {'message': "Not authorised to perform this action"}
#         return make_response(response), 401

#     if not project_user_col.find_one({'email': requestor_email})[
#         'isAdmin']:  # if the requestor is not an admin, return forbidden
#         response = {'message': "Forbidden to perform this action"}
#         return make_response(response), 403

#     if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
#         response = {'message': "That user does not exist in the project, add them to the project first"}
#         return make_response(response), 400

#     count = project_user_col.count_documents({'isContributor': True})

#     if 'isContributor' in permissions and permissions['isContributor'] and count >= 2:
#         response = {'message': "There are already two contributors within this project, and you cannot add more"}
#         return make_response(response), 400
#     # if user is going to not be a contributor, remove that the labels assigned by that contributor
#     elif not permissions['isContributor']:
#         remove_all_labels_of_user(email, project_name)

#     project_user_col.update_one({'email': email}, {'$set': permissions})
#     return "", 204


# @user_api.route("/projects/<project_name>/users/delete", methods=["Put"])
# # admin or requestor can remove
# def remove_user_from_project(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if 'user' in request.json:
#         email = request.json['user']
#     else:
#         response = {'message': "Missing user"}
#         response = make_response(response)
#         return response, 400

#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email})
#     if requestor_email == email or requestor[
#         'isAdmin']:  # if you want to delete yourself, or are an admin, can delete others
#         users_col.delete_one({'email': email})
#         remove_project_from_user(email, project_name)
#         remove_all_labels_of_user(email, project_name)
#     return "", 204


# @user_api.route("/user/delete", methods=["Delete"])
# # requestor can remove themself
# def remove_user():
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     get_col("users", "users").delete_one({"email": requestor_email})
#     return "", 204
