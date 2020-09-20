from bson import ObjectId

import mongoDBInterface


class Project:
    def __init__(self, name, preset_labels, documents):
        self.preset_labels = preset_labels
        self.documents = documents
        self.name = name

    def create_project_database(self):
        my_client = mongoDBInterface.get_db_client()
        if not my_client.list_database_names().__contains__(self.name):
            mongoDBInterface.create_db_for_proj(self.name)

    def set_labels(self, preset_labels):
        self.preset_labels = preset_labels
        # link with DB and push there new list of labels

    def add_document(self, document):
        self.documents.append(document)

