from api.methods import JSONEncoder, add_project_to_user, remove_project_from_user, remove_all_labels_of_user
from api.validation_methods import check_id_token
from firebase_auth import get_email
from flask import Blueprint, request, make_response
from mongoDBInterface import get_col

user_api = Blueprint('user_api', __name__)


@user_api.route("/users", methods=["GET"])
def get_user_info_from_email():
    # inputs: id_token of requestor, project name, email of user to be added to project
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    email = request.args.get('email')
    if email is None or email == "":
        response = {'message': "Email is not included with the request uri in args"}
        return make_response(response), 400

    user_to_add = get_col("users", "users").find_one({'email': email})
    if user_to_add is None:
        response = {'message': "User does not exist/does not have an account"}
        return make_response(response), 400

    user_to_add = JSONEncoder().encode(user_to_add)
    return user_to_add, 200


@user_api.route("/user/all", methods=['Get'])
def get_all_users_emails():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    users_col = get_col("users", "users")
    all_users = users_col.find({}, {'email': 1})
    all_users_dict = {"users": list(all_users)}
    all_users_json = JSONEncoder().encode(all_users_dict)
    return all_users_json, 200


@user_api.route("/projects/<project_name>/user", methods=["Get"])
def get_current_user_for_proj(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    project_user_col = get_col(project_name, "users")
    requestor = project_user_col.find_one({'email': requestor_email})
    user_json = JSONEncoder().encode(requestor)
    return user_json, 200


@user_api.route("/users/all", methods=["Get"])
# Gets all user emails within any database
def get_user_emails():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    users_col = get_col("users", "users")
    all_users = users_col.find({}, {'email': 1}).skip(page * page_size).limit(page_size)
    all_users_dict = {"users": list(all_users)}
    all_users_json = JSONEncoder().encode(all_users_dict)
    return all_users_json, 200


@user_api.route("/projects/<project_name>/users", methods=["Get"])
def get_user_infos_for_project(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    users_col = get_col(project_name, "users")

    if users_col.find_one({'email': requestor_email}) is None:
        response = {'message': "Not allowed to perform this action unless you are part of the project"}
        response = make_response(response)
        return response, 403

    all_users = users_col.find({}).skip(page * page_size).limit(page_size)
    all_users_dict = {"users": list(all_users)}
    all_users_json = JSONEncoder().encode(all_users_dict)
    return all_users_json, 200


@user_api.route("/user", methods=["Get"])
def get_user_info():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    users_col = get_col("users", "users")
    user_dict = users_col.find_one({"email": requestor_email})
    user_json = JSONEncoder().encode(user_dict)
    return user_json, 200


@user_api.route("/users/create", methods=["Post"])
def create_user():
    print("create user function gets called");

    # creates a new user based ogn the ID token that gets sent over
    invalid_token = check_id_token(request.args.get('id_token'))
    print("invalid token is: ")
    print(invalid_token)

    if invalid_token is not None:
        return make_response(invalid_token), 

    requestor_email = get_email(request.args.get('id_token'))
    print("email: " + requestor_email)

    db_user = get_user_from_database_by_email(requestor_email)
    print("user find from database using email")
    print(db_user)

    if db_user is not None:
        response = {'message': "User already exists"}
        return make_response(response), 400

    if 'username' in request.json:
        username = request.json['username']
        print("username: " + username)
        
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

    # is part of! When a new user is created it should be empty

    return "", 204


@user_api.route("/projects/<project_name>/users/add", methods=["Post"])
# Adding a new user to a project
def add_user_to_project(project_name):
    # inputs: id_token of requestor, project name, email of user to be added to project
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        return make_response(response), 400

    # check if the new user is already in the "users" collection in the "users" database
    user_to_add = get_col("users", "users").find_one({'email': email})

    if user_to_add is None:
        response = {'message': "User does not exist/does not have an account"}
        return make_response(response), 400

    project_user_col = get_col(project_name, "users")
    if project_user_col.find_one(
            {'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
        response = {'message': "Not authorised to perform this action"}
        return make_response(response), 401

    if not project_user_col.find_one({'email': requestor_email})[
        'isAdmin']:  # if the requestor is not an admin, return forbidden
        response = {'message': "Forbidden to perform this action"}
        return make_response(response), 403

    if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
        project_user_col.insert_one({'email': email, 'isAdmin': False, 'isContributor': False})
        add_project_to_user(email, project_name)
        return "", 204
    else:
        response = {'message': "That user is already in the provided project"}
        return make_response(response), 400


@user_api.route("/projects/<project_name>/users/update", methods=["Put"])
# Updating user permissions in a particular project
def update_user(project_name):
    # inputs: id_token of requestor, project name, email of user to be changed, and changes to be applied
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

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

    project_user_col = get_col(project_name, "users")
    if project_user_col.find_one(
            {'email': requestor_email}) is None:  # if requestor is not in project, return unauthorised
        response = {'message': "Not authorised to perform this action"}
        return make_response(response), 401

    if not project_user_col.find_one({'email': requestor_email})[
        'isAdmin']:  # if the requestor is not an admin, return forbidden
        response = {'message': "Forbidden to perform this action"}
        return make_response(response), 403

    if project_user_col.find_one({'email': email}) is None:  # if cannot find an existing user for that email
        response = {'message': "That user does not exist in the project, add them to the project first"}
        return make_response(response), 400

    count = project_user_col.count_documents({'isContributor': True})

    if 'isContributor' in permissions and permissions['isContributor'] and count >= 2:
        response = {'message': "There are already two contributors within this project, and you cannot add more"}
        return make_response(response), 400
    # if user is going to not be a contributor, remove that the labels assigned by that contributor
    elif not permissions['isContributor']:
        remove_all_labels_of_user(email, project_name)

    project_user_col.update_one({'email': email}, {'$set': permissions})
    return "", 204


@user_api.route("/projects/<project_name>/users/delete", methods=["Put"])
# admin or requestor can remove
def remove_user_from_project(project_name):
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    if 'user' in request.json:
        email = request.json['user']
    else:
        response = {'message': "Missing user"}
        response = make_response(response)
        return response, 400

    users_col = get_col(project_name, "users")
    requestor = users_col.find_one({'email': requestor_email})
    if requestor_email == email or requestor[
        'isAdmin']:  # if you want to delete yourself, or are an admin, can delete others
        users_col.delete_one({'email': email})
        remove_project_from_user(email, project_name)
        remove_all_labels_of_user(email, project_name)
    return "", 204


@user_api.route("/user/delete", methods=["Delete"])
# requestor can remove themself
def remove_user():
    id_token = request.args.get('id_token')
    requestor_email = get_email(id_token)

    invalid_token = check_id_token(id_token, requestor_email)
    if invalid_token is not None:
        return make_response(invalid_token), 400

    get_col("users", "users").delete_one({"email": requestor_email})
    return "", 204
