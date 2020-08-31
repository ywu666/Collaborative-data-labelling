import unittest

from backend.model.document import Document

class TestDocument(unittest.TestCase):

    # tests whether or not setting up a document works
    def test_setup_document(self):
        my_document = Document(1, "data")
        assert(my_document.identifier == 1 and my_document.data == "data")


if __name__ == '__main__':
    unittest.main()