from os import terminal_size
from enums.user_role import UserRole
from database.project_dao import get_all_users_associated_with_a_project, get_users_associated_with_a_project, get_owner_of_the_project, get_project_by_id, \
    add_collaborator_to_project, change_collaborator_permission, add_collaborator_to_encrypt_project
from middleware.auth import check_token
# from api.methods import JSONEncoder, add_project_to_user, remove_project_from_user, remove_all_labels_of_user
from flask import Blueprint, request, make_response, jsonify, g
# from mongoDBInterface import get_col
from database.user_dao import get_user_from_database_by_email, get_user_from_database_by_username, save_user, \
    save_user_key, get_all_user_email_from_database, does_user_belong_to_a_project

user_api = Blueprint('user_api', __name__)


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


@user_api.route("/user/user_key", methods=['GET'])
@check_token
def get_current_user_key():
    email = request.args.get('email')
    user_email = g.requestor_email

    if email is not None:
        user_email = email

    user = get_user_from_database_by_email(user_email)
    if user.key:
        print(user.key)
        return jsonify(user.key), 200
    else:
        response = {'message': "The user didn't have the user key"}
        return make_response(response), 400


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
def get_current_user_for_project(project_id):
    collaborators = get_all_users_associated_with_a_project(project_id)
    collaborator = next(
        (collaborator for collaborator in collaborators if collaborator.user.email == g.requestor_email), None)
    user = {
        '_id': str(collaborator.user.id),
        # a user had admin rights if he is the owner or a admin
        'isAdmin': True if collaborator.role == UserRole.OWNER else False,
        'isContributor': True if collaborator.role == UserRole.COLLABORATOR or collaborator.role == UserRole.OWNER else False
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

    encryption_state = get_project_by_id(project_id).encryption_state

    collaborators = get_users_associated_with_a_project(
        project_id, page, page_size)
    users = []
    for collaborator in collaborators:
        user = collaborator.user
        dict = {
            'id': str(user.id),
            'email': user.email,
            'isAdmin': True if collaborator.role == UserRole.OWNER else False,
            'isContributor': True if collaborator.role == UserRole.COLLABORATOR else False,
            'needPublicKey': True if encryption_state and user.key == None else False,
            'needEntryKey': True if encryption_state and user.key != None and collaborator.entry_key == None else False
        }
        users.append(dict)

    result = {
        'users': users
    }
    return jsonify(result), 200


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
            user = {
                "username": username,
                "email": requestor_email
            }

            save_user(user)
    else:
        response = {'message': "Missing username"}
        return make_response(response), 400

    # a new user created, the en_private_key is returned to the frontend
    return '', 204


@user_api.route("/users/store_user_key", methods=["Post"])
@check_token
def store_user_key():
    requestor_email = g.requestor_email
    db_user = get_user_from_database_by_email(requestor_email)

    if db_user is not None:
        keys = request.json["userKey"]

        save_user_key(keys, db_user)
    else:
        response = {'message': "Missing the user"}
        return make_response(response), 400

    return '', 204


@user_api.route("/projects/<project_id>/users/add", methods=["Post"])
@check_token
# Adding a new user to a project
def add_user_to_project(project_id):
    # inputs: id_token of requestor, project name, email of user to be added to project
  
    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        return make_response(response), 400

    requestor_email = g.requestor_email
    user_to_add_db = get_user_from_database_by_email(email)

    if user_to_add_db is None:
        response = {'message': "User does not exist/does not have an account"}
        return make_response(response), 400

    # check if requestor is in the project
    if not does_user_belong_to_a_project(requestor_email, project_id):
        response = {'message': "Not authorised to perform this action"}
        return make_response(response), 401

    # check if requestor is admin
    if get_owner_of_the_project(get_project_by_id(project_id)).email != requestor_email:
        response = {'message': "Forbidden to perform this action"}
        return make_response(response), 403

    collaborators = get_all_users_associated_with_a_project(project_id)
    if len(list(filter(lambda collaborator: collaborator.user.email == email, collaborators))) == 0:
        if 'en_entry_key' in request.json and request.json['en_entry_key'] != "":
            en_entry_key = request.json['en_entry_key']
            add_collaborator_to_encrypt_project(
                project_id, user_to_add_db, en_entry_key)
        else:
            add_collaborator_to_project(project_id, user_to_add_db)

        return "", 204
    else:
        response = {'message': "That user is already in the provided project"}
        return make_response(response), 400


@user_api.route("/projects/<project_id>/users/update", methods=["Put"])
@check_token
# Updating user permissions in a particular project
def update_user(project_id):
    # inputs: id_token of requestor, project name, email of user to be changed, and changes to be applied
    requestor_email = g.requestor_email

    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        return make_response(response), 400
    if 'permissions' in request.json:
        permissions = request.json['permissions']
    else:
        response = {'message': "Missing permissions"}
        return make_response(response), 400

     # check if requestor is in the project
    if not does_user_belong_to_a_project(requestor_email, project_id):
        response = {'message': "Not authorised to perform this action"}
        return make_response(response), 401

    # check if requestor is admin
    if get_owner_of_the_project(get_project_by_id(project_id)).email != requestor_email:
        response = {'message': "Forbidden to perform this action"}
        return make_response(response), 403

    collaborators = get_all_users_associated_with_a_project(project_id)
    if len(list(filter(lambda collaborator: collaborator.user.email == email, collaborators))) == 0:
        response = {'message': "That user does not exist in the project, add them to the project first"}
        return make_response(response), 400

    count = len(list(filter(lambda collaborator: collaborator.role == UserRole.COLLABORATOR, collaborators)))
    if 'isContributor' in permissions and permissions['isContributor'] and count >= 2:
        response = {'message': "There are already two contributors within this project, and you cannot add more"}
        return make_response(response), 400

    # if user is going to not be a contributor, remove that the labels assigned by that contributor
    # assuming user can only change permission from viewer to admin or collaborator, and cannot change back to viewer again 
    user_role = UserRole.OWNER if permissions['isAdmin'] else UserRole.COLLABORATOR
    change_collaborator_permission(project_id, email, user_role)
    return "", 204


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
