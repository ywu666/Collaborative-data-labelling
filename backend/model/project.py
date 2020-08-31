from bson import ObjectId

from backend import mongoDBInterface


class Project:
    def __init__(self, name, preset_labels, documents):
        self.preset_labels = preset_labels
        self.documents = documents
        self.name = name

    def add_project(self):
        col = self.get_db_collection("Test", "projects")
        col.insert_one(self.__dict__)

    def set_labels(self, _id, preset_labels):
        self.preset_labels = preset_labels
        # link with DB and push there new list of labels
        col = self.get_db_collection("Test", "projects")
        col.find_one_and_update({"_id": _id}, {"$set": self.__dict__})

    def add_document(self, document):
        self.documents.append(document)
        # link with DB and push there when appending something

    def get_db_collection(self, proj, col):
        col = mongoDBInterface.get_col(proj, col)
        return col