import firebase_admin
from firebase_admin import auth, credentials


def get_email(id_token):
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token['email']


if __name__ == '__main__':
    cred = credentials.Certificate("collaborative-content-coding-firebase-adminsdk-dpj86-0d9f3ad3d8.json")
    default_app = firebase_admin.initialize_app(cred)
