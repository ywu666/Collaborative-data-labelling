from enums.user_role import UserRole
from flask.json import jsonify
from database.user_dao import does_user_belong_to_a_project, get_user_from_database_by_email
from api.validation_methods import user_unauthorised_response
from database.project_dao import get_document_of_a_project, count_number_of_unlabelled_docs, \
    get_all_users_associated_with_a_project, get_single_document_of_a_project, get_project_by_id
from middleware.auth import check_token
from flask import Blueprint, request, make_response, g
import re

document_api = Blueprint('document_api', __name__)


@document_api.route('/projects/<project_id>/documents', methods=['Get'])
@check_token
def get_document_ids(project_id):
    try:
        page = int(request.args.get('page'))
        page_size = int(request.args.get('page_size'))
    except (ValueError, TypeError):
        response = {'message': "page and page_size must be integers"}
        return make_response(response), 400

    requestor_email = g.requestor_email
    userId = get_user_from_database_by_email(requestor_email).id

    # check the user is one of the collaborators
    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    data = get_document_of_a_project(project_id, page, page_size)
    docs = []
    # for each data, only keep label given by the current user
    for d in data:
        labelByUser = next((item for item in d.labels if item.user.id == userId), None)

        result = {
            'display_id': d.display_id,
            'label': labelByUser.label if labelByUser else None,
            'data': d.value,
            'label_confirmed': False if d.final_label is None else True
        }
        docs.append(result)

    result = {
        'docs': docs,
        'count': len(get_project_by_id(project_id).data)
    }

    return jsonify(result), 200


@document_api.route('/projects/<project_id>/documents/<document_index>', methods=['Get'])
@check_token
# Getting a document!
def get_document(project_id, document_index):
    requestor_email = g.requestor_email
    userId = get_user_from_database_by_email(requestor_email).id

    # check the user is one of the collaborators
    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    data = get_single_document_of_a_project(project_id, document_index)
    labelByUser = next((labelResult for labelResult in data.labels if labelResult.user.id == userId), None)

    doc = {
        'display_id': data.display_id,
        'label': labelByUser.label if labelByUser else None,
        'data': data.value,
        'label_confirmed': False if data.final_label is None else True
    }

    return jsonify(doc), 200


# @document_api.route('/projects/<project_name>/documents/<document_id>/delete', methods=['Get'])
# # Getting a document!
# def delete_document(project_name, document_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email, 'isAdmin': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     col = get_db_collection(project_name, "documents")
#     col.delete_one({'_id': ObjectId(document_id)})
#     return "", 204


# Gets number of unlabelled docs for each user
@document_api.route('/projects/<project_id>/unlabelled/contributors', methods=['Get'])
@check_token
def get_number_of_unlabelled_docs_for_contributors(project_id):
    print("get number of unlablled endpoint called")
    requestor_email = g.requestor_email

    # check the user is one of the collaborators
    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()

    collaborators = get_all_users_associated_with_a_project(project_id)
    output = []
    for collaborator in collaborators:
        if collaborator.role == UserRole.OWNER or collaborator.role == UserRole.COLLABORATOR:
            num_docs = count_number_of_unlabelled_docs(project_id, collaborator.user.email)

            current_user_dict = \
                {
                    'email': collaborator.user.email,
                    'number_unlabelled': num_docs
                }
            output.append(current_user_dict)

    output_dict = {'contributors': output}
    return output_dict, 200

# @document_api.route('/projects/<project_name>/documents', methods=['Post'])
# # Creating a new document!
# def create_document(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     if 'content' in request.json:
#         content = request.json['content']
#     else:
#         response = {'message': "Missing content"}
#         return make_response(response), 400

#     doc = Document(content, [], [])
#     doc.data = content
#     doc.upload(project_name)
#     return '', 204


# @document_api.route('/projects/<project_name>/documents/<document_id>/comments/post', methods=['Post'])
# def post_comment_on_document(project_name, document_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     if 'comment' in request.json:
#         comment = request.json['comment']
#     else:
#         response = {'message': "Missing comment"}
#         return make_response(response), 400

#     # have to be contributor, should include email, time and content of comment for every comment
#     users_col = get_col(project_name, "users")
#     requestor = users_col.find_one({'email': requestor_email, 'isContributor': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     documents_col = get_col(project_name, "documents")
#     current_time = datetime.datetime.now()
#     documents_col.update_one({'_id': ObjectId(document_id)},
#                              {'$push': {
#                                  'comments': {
#                                      'email': requestor_email,
#                                      'comment_body': comment,
#                                      'time': str(current_time)
#                                  }
#                              }})
#     return '', 204


# if __name__ == '__main__':
#     col = get_col("New_Project", "documents")
