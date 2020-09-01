from backend import mongoDBInterface
from backend.model.document import Document
from backend.model.label import Label
from backend.model.user import User


# tests whether or not setting up a document works
def test_setup_document():
    my_document = Document(1, "data")
    assert (my_document.identifier == 1 and my_document.data == "data")


# Tests that document is persisted to db when added
def test_add_document():
    my_document = Document(3, "data")
    col = mongoDBInterface.get_col("Test", "documents")
    my_document.add_new_document()
    assert (col.find_one({"identifier": 3}))


# Tests that an entry is placed in hashmap when user labels a document
def test_add_user_and_label():
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


def setup_module():
    col = mongoDBInterface.get_col("Test", "documents")
    col.drop()
