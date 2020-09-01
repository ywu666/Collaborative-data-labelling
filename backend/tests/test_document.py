import unittest

from backend import mongoDBInterface
from backend.model.document import Document
from backend.model.label import Label
from backend.model.user import User


class TestDocument(unittest.TestCase):

    # tests whether or not setting up a document works
    def test_setup_document(self):
        my_document = Document(1, "data")
        assert(my_document.identifier == 1 and my_document.data == "data")

    def test_add_document(self):
        my_document = Document(3, "data")
        col = mongoDBInterface.get_col("Test", "documents")
        my_document.add_new_document()
        assert (col.find_one({"identifier": 3}))

    def test_add_user_and_label(self):
        my_document = Document(4, "test data")
        # Need to put document in database
        my_document.add_new_document()

        user = User("User 1", "Last name", "testingDoc@testmail.com", [])
        label = Label("Document")

        my_document.add_user_and_label(4, user, label)

        col = mongoDBInterface.get_col("Test", "documents")
        document_in_database = col.find_one({"identifier": 4})

        assert (user.email in document_in_database["user_and_labels"])
        assert (document_in_database["user_and_labels"][user.email] == label.__dict__)

    @classmethod
    def setUpClass(cls) -> None:
        col = mongoDBInterface.get_col("Test", "documents")
        col.drop()


if __name__ == '__main__':
    unittest.main()