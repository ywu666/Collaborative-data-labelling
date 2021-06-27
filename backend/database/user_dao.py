from database.model.model import User

def get_user_from_database_by_email(email):
    try:
        user = User.objects(email=email).get_or_404()
        return user
    except:
        return None

def get_user_from_database_by_username(username):
    try:
        user = User.objects(username=username).get_or_404()
        return user
    except:
        return None

def save_user(user):
    print(user)
    user = User(**user)
    user.save()
