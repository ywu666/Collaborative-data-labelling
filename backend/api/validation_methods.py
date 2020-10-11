from flask import make_response


def check_id_token(id_token, requestor_email):
    response = None
    if id_token is None or id_token == "":
        response = {'message': "ID Token is not included with the request uri in args"}

    if requestor_email is None:
        response = {'message': "ID Token has expired or is invalid"}

    return response
