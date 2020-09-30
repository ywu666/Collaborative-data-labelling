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


def remove_all_labels_of_user(user_email, project_name):
    document_col = get_col(project_name, "documents")
    document_col.update(
        {
            "user_and_labels": {
                "$elemMatch": {
                    "email": user_email
                }
            }
        },
        {
            "$pull": {
                "user_and_labels": {
                    "email": user_email
                }
            }})


def set_user_document_label(col, email, document_id, label_id, label_is_confirmed):
    # col = get_col(project_name, "documents")
    col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": email}}},
                   {'$set': {
                       "user_and_labels.$.label": ObjectId(label_id),
                       "user_and_labels.$.label_confirmed": label_is_confirmed,
                       "label_confirmed": label_is_confirmed}
                   })


def update_user_document_label(col, email, document_id, label_id, label_is_confirmed):
    # col = get_col(project_name, "documents")
    col.update_one({'_id': ObjectId(document_id)},
                   {'$push': {
                       "user_and_labels": {
                           "email": email,
                           "label": ObjectId(label_id),
                           "label_confirmed": label_is_confirmed}
                   },
                       '$set': {"label_confirmed": label_is_confirmed}
                   })
