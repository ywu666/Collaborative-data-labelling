from model.document import Document


# tests whether or not setting up a document works
def test_setup_document():
    my_document = Document(1, "data")
    assert(my_document.identifier == 1 and my_document.data == "data")
