from bson import ObjectId
from flask import make_response
# from model.document import get_db_collection

def user_unauthorised_response():
    response = {'message': "You are not authorised to perform this action"}
    response = make_response(response)
    return response, 403


def invalid_label_response():
    response = {'message': "Invalid Label"}
    return make_response(response), 400