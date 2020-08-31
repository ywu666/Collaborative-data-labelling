from backend import mongoDBInterface


class Label:

    def __init__(self, name):
        self.name = name

        self.add_new_label

    # Method called to persist label to database
    def add_new_label(self):
        col = mongoDBInterface.get_col("Test", "labels")
        col.insert_one(self.__dict__)

