from flask.json import jsonify
from database.project_dao import get_all_labels_of_a_project
from database.user_dao import get_user_from_database_by_email, does_user_belong_to_a_project
from middleware.auth import check_token
from api.validation_methods import user_unauthorised_response
from flask import Blueprint, g

label_api = Blueprint('label_api', __name__)


@label_api.route('/projects/<project_id>/labels/all', methods=['Get'])
@check_token
def get_preset_labels(project_id):
    requestor_email = g.requestor_email

    if not does_user_belong_to_a_project(requestor_email, project_id):
        return user_unauthorised_response()
    
    labels = get_all_labels_of_a_project(project_id)
    labels_list = [label.value for label in labels]

    labels_dict = {
        'labels': labels_list
    }

    return jsonify(labels_dict), 200


# @label_api.route('/projects/<project_name>/labels/add', methods=['Post'])
# def add_preset_labels(project_name):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     user_col = get_db_collection(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     if 'label_name' in request.json:
#         label_name = request.json['label_name']
#     else:
#         response = {'message': "Missing label to add"}
#         return make_response(response), 400

#     labels_col = get_col(project_name, "labels")
#     label_in_database = labels_col.find_one({"name": label_name})

#     if label_in_database is not None:
#         response = {'message': "That label already exists"}
#         return make_response(response), 400

#     labels_col.insert_one({"name": label_name})
#     return "", 204


# @label_api.route('/projects/<project_name>/labels/<label_id>/update', methods=['Put'])
# def update_preset_labels(project_name, label_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     user_col = get_db_collection(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     if 'label_name' in request.json:
#         label_name = request.json['label_name']
#     else:
#         response = {'message': "Missing label to add"}
#         return make_response(response), 400

#     labels_col = get_col(project_name, "labels")
#     labels_col.update_one({"_id": ObjectId(label_id)}, {'$set': {'name': label_name}})
#     return "", 204


# @label_api.route('/projects/<project_name>/labels/<label_id>/delete', methods=['Delete'])
# def delete_preset_labels(project_name, label_id):
#     id_token = request.args.get('id_token')
#     requestor_email = get_email(id_token)

#     invalid_token = check_id_token(id_token, requestor_email)
#     if invalid_token is not None:
#         return make_response(invalid_token), 400

#     user_col = get_db_collection(project_name, "users")
#     requestor = user_col.find_one({'email': requestor_email, 'isAdmin': True})
#     if requestor is None:
#         return user_unauthorised_response()

#     labels_col = get_col(project_name, "labels")
#     labels_col.delete_one({"_id": ObjectId(label_id)})
#     # Go into each document, and delete all mentions of that label from each document
#     document_col = get_col(project_name, "documents")
#     document_col.update(
#         {
#             "user_and_labels": {
#                 "$elemMatch": {
#                     "label": ObjectId(label_id)
#                 }
#             }
#         },
#         {
#             "$pull": {
#                 "user_and_labels": {
#                     'label': ObjectId(label_id)}
#             }
#         })

#     return "", 204
