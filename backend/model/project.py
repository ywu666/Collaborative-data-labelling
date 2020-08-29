class Project:
    def __init__(self, name, preset_labels, documents):
        self.preset_labels = preset_labels
        self.documents = documents
        self.name = name

    def set_labels(self, preset_labels):
        self.preset_labels = preset_labels
        # link with DB and push there new list of labels

    def add_document(self, document):
        self.documents.append(document)
        # link with DB and push there when appending something
