from api.validation_methods import user_unauthorised_response
from database.user_dao import does_user_belong_to_a_project, get_user_public_key, get_user_from_database_by_email
from database.project_dao import create_new_project, get_all_projects_of_a_user, get_owner_of_the_project, \
    get_project_by_id, get_all_users_associated_with_a_project
from middleware.auth import check_token
from database.model import Project
from flask import Blueprint, request, make_response, g, jsonify
import re

project_api = Blueprint('project_api', __name__)


@project_api.route("/projects/all", methods=['GET'])
@check_token
def get_projects():
    requestor_email = g.requestor_email
    projects_of_the_user = get_all_projects_of_a_user(requestor_email)
    projects = []

    for p in projects_of_the_user:
        projects.append({
            '_id': str(p.id),
            'name': p.project_name,
            'owner': get_owner_of_the_project(p).username,
            'encryption_state': p.encryption_state
        })

    # sort projects by owner
    projects = sorted(projects, key=lambda k: k['owner'])
    response = {'projects': projects}
    return make_response(response), 200


@project_api.route("/projects/<project_id>", methods=['GET'])
@check_token
def get_project_description(project_id):
    requestor_email = g.requestor_email

    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    project = get_project_by_id(project_id)
    owner = get_owner_of_the_project(project)

    project = {
        '_id': str(project.id),
        'owner': owner.username,
        'name': project.project_name,
        'state': project.state,
        'encryption_state': project.encryption_state
    }

    # sort projects by owner
    response = {'project': project}
    return make_response(response), 200


# @project_api.route('/projects/<project_name>/agreement_score', methods=['GET'])
# def get_agreement_score(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     user_col = get_col(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email})
#     if requestor is None:
#         return user_unauthorised_response()

#     doc_col = get_col(project_name, "documents")

#     all_docs = doc_col.find({})
#     agreed = 0
#     not_agreed = 0
#     for doc in all_docs:
#         if len(doc['user_and_labels']) == 2:
#             label_1 = doc['user_and_labels'][0]['label']
#             label_2 = doc['user_and_labels'][1]['label']
#             if label_1 == label_2:
#                 agreed = agreed + 1
#             else:
#                 not_agreed = not_agreed + 1

#     analysed = agreed + not_agreed

#     return_dict = {
#         "agreed_number": agreed,
#         "not_agreed_number": not_agreed,
#         "analysed_number": analysed,
#         "total_number": doc_col.count_documents({})
#     }

#     return return_dict, 200

'''
Create a new project for the current user
request format:
body： {
    project_name: project_name,
    encryption_state: True/False
}
'''


@project_api.route("/projects/create", methods=['POST'])
@check_token
def create_project():
    print("create project called")
    requestor_email = g.requestor_email

    print(request.json)
    if 'project_name' in request.json:
        project_name = request.json['project_name']
        print(project_name)
    else:
        response = {'message': "Missing project name"}
        return make_response(response), 400

    if not re.match(r'^\w+$', project_name):
        response = {'message': "Project name can only be Alphanumerics and underscores"}
        return make_response(response), 400

    db_project = get_user_from_database_by_email(requestor_email).projects
    # check this user did not create a project with the same name before 
    if not any((project.project_name == project_name and get_owner_of_the_project(project).email == requestor_email) for
               project in db_project):
        # TODO check if the project should be encrypted, if yes, generate encrypted entry key 
        en_entry_key = request.json['en_entry_key']
        js = request.json
        del js['en_entry_key']
        print(js)
        if en_entry_key != '':
            create_new_project(requestor_email, js, en_entry_key)
        else:
            print('not encrypt project')
            create_new_project(requestor_email, js)
    else:
        response = {'message': "Project already exists"}
        return make_response(response), 400

    return "", 204


@project_api.route("/projects/<project_id>/en_entry_key", methods=['GET'])
@check_token
def get_en_entry_key(project_id):
    requestor_email = g.requestor_email

    collaborators = get_all_users_associated_with_a_project(project_id)
    collaborator = list(filter(lambda collaborator: collaborator.user.email ==
                               requestor_email, collaborators))[0]
    if collaborator.entry_key:
        en_entry_key = {'en_entry_key': collaborator.entry_key}
        return en_entry_key, 200
    else:
        response = {
            'message': "The current user does not have a entry key for this project"}
        return make_response(response), 400

# @project_api.route("/projects/<project_name>/delete", methods=['DELETE'])
# def delete_project(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if project_name == "local" or project_name == "users" or project_name == "admin":
#         response = {'message': "Cannot delete that project because it is not a user created project"}
#         return make_response(response), 400

#     user_col = get_col(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     my_client = get_db_client()
#     names = my_client.list_database_names()
#     if project_name in names:
#         all_users = user_col.find({})
#         for user in all_users:
#             user_email = user['email']
#             remove_project_from_user(user_email, project_name)
#         my_client.drop_database(project_name)
#     else:
#         response = {'message': "Project does not exist"}
#         return make_response(response), 400

#     return "", 204
