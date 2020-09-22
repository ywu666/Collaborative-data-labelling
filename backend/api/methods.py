import json
from bson import ObjectId

from mongoDBInterface import get_col


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


def add_project_to_user(user_email, project_name):
    user_col = get_col("users", "users")
    user_col.update_one({"email": user_email}, {"$push": {"projects": project_name}})


def remove_project_from_user(user_email, project_name):
    user_col = get_col("users", "users")
    user_col.update_one({"email": user_email}, {"$pull": {"projects": project_name}})
