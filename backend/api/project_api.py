from flask import Blueprint, request, make_response

import mongoDBInterface

project_api = Blueprint('project_api', __name__)


@project_api.route("/projects", methods=['POST'])
def create_project():
    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'message': "Missing projectID"}
        response = make_response(response)
        return response, 400

    my_client = mongoDBInterface.get_db_client()
    if project not in my_client.list_database_names():
        mongoDBInterface.create_db_for_proj(project)
        response = {'message': "Created project"}
        response = make_response(response)
        return response, 204
    else:
        response = {'message': "Project already exists"}
        response = make_response(response)
        return response, 400


@project_api.route("/projects", methods=['GET'])
def get_projects():
    my_client = mongoDBInterface.get_db_client()
    names = my_client.list_database_names()
    names.remove("admin")
    names.remove("local")
    response = {'projects': names}
    response = make_response(response)
    return response, 200


@project_api.route("/projects/<project_name>", methods=['DELETE'])
def delete_project(project_name):
    my_client = mongoDBInterface.get_db_client()
    names = my_client.list_database_names()
    if project_name in names:
        my_client.drop_database(project_name)
        response = {'message': "Deleted project"}
        response = make_response(response)
        return response, 204
    else:
        response = {'message': "Project does no exist"}
        response = make_response(response)
        return response, 400


if __name__ == '__main__':
    my_client = mongoDBInterface.get_db_client()
    print(my_client.list_database_names())