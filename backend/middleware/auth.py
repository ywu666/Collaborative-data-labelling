from firebase_admin import auth
from flask import request, g
from functools import wraps

'''
check if correct token is provided  
this method gets the token from the request header, verifies it, and add user's email into the request body
then pass the request to the endpoint that gets invoked 
This requires request has the following header:
{
    Authorization: Bearer token
}
'''


def check_token(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        auth_token = request.headers.get('token')
        print(auth_token)
        if auth_token is None:
            auth_token = ""

        if not auth_token:
            return {'message': 'No token provided'}, 400
        try:
            user = auth.verify_id_token(auth_token)
            g.requestor_email = user['email']
        except Exception as e:
            print(e)
            return {'message': 'Invalid token provided.'}, 400
        return f(*args, **kwargs)

    return wrap
