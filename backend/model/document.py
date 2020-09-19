from bson import ObjectId

import mongoDBInterface


def get_db_collection(proj, col):
    col = mongoDBInterface.get_col(proj, col)
    return col


class Document:

    def __init__(self, data, comments, user_and_labels):
        self.data = data
        self.comments = comments
        self.user_and_labels = user_and_labels

    def add_user_and_label(self, project_name, _id, user, label):
        self.user_and_labels.append({user.email: label.__dict__})

    def upload(self, project_name):
        col = get_db_collection(project_name, "documents")
        col.insert_one(self.__dict__)

    def update(self, project_name, _id):
        col = get_db_collection(project_name, "documents")
        col.update_one(
            {"_id": ObjectId(_id)},
            {"$set": self.__dict__}
        )


