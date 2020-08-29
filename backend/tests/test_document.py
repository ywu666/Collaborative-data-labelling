from model.document import Document


def test_setup_document():
    my_document = Document(1, "data")
    assert(my_document.identifier == 1 and my_document.data == "data")
