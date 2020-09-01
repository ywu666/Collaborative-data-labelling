from backend import mongoDBInterface


def get_db_collection(proj, col):
    col = mongoDBInterface.get_col(proj, col)
    return col


class Document:

    def __init__(self, identifier, data):
        self.identifier = identifier
        self.data = data
        self.user_and_labels = {}

    def add_new_document(self):
        col = get_db_collection("Test", "documents")
        col.insert_one(self.__dict__)

    def add_user_and_label(self, identifier, user, label):
        self.user_and_labels.update({user.email: label.__dict__})

        # push changes to mongodb
        col = get_db_collection("Test", "documents")
        col.find_one_and_update({"identifier": identifier}, {"$set": self.__dict__})
