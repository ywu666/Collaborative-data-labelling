from database.model import User


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
    user = User(**user)
    user.save()


def get_all_user_email_from_database():
    users = User.objects.only('email')
    return users


def does_user_belong_to_a_project(email, project_id):
    user = User.objects(projects=project_id, email=email)
    if not user:
        return False
    return True
