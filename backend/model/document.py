class Document:

    def __init__(self, identifier, data):
        self.identifier = identifier
        self.data = data
        self.user_and_labels = {}

    def add_user_and_label(self, user, label):
        self.user_and_labels.update({user.email: label})
        # push changes to mongodb
