from firebase_admin import auth
from flask import request
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
    def wrap(*args,**kwargs):
        auth_header = request.headers.get('Authorization')

        if auth_header:
            auth_token = auth_header.split(" ")[1]
        else:
            auth_token = ""

        if not auth_token:
            return {'message': 'No token provided'},400
        try:
            user = auth.verify_id_token(auth_token)
            request.json["email"] = user['email']
        except:
            return {'message':'Invalid token provided.'},400
        return f(*args, **kwargs)
    return wrap