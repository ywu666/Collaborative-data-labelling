from bson import ObjectId
from flask import make_response
from model.document import get_db_collection


def check_id_token(id_token, requestor_email):
    response = None
    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}

    return response


def user_unauthorised_response():
    response = {'message': "You are not authorised to perform this action"}
    response = make_response(response)
    return response, 403


def invalid_label_response(project_name, label_id):
    response = None
    label_col = get_db_collection(project_name, "labels")
    label = label_col.find_one({'_id': ObjectId(label_id)})
    if label is None:
        response = {'message': "Invalid Label"}
        return make_response(response), 400
    else:
        return response
