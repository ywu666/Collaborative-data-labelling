import unittest

from backend import mongoDBInterface
from backend.model.label import Label


class LabelTest(unittest.TestCase):
    # Tests whether or not setting up a label works
    def test_setup_label(self):
        my_label = Label("Music")
        assert (my_label.name == "Music")

    # Tests if data is persisted to database when new label created
    def test_new_lable_persisted(self):
        my_label = Label("New Label")
        my_label.add_new_label()

        col = mongoDBInterface.get_col("Test", "labels")
        assert (col.find(my_label.__dict__))

    @classmethod
    def setUpClass(cls) -> None:
        col = mongoDBInterface.get_col("Test", "labels")
        col.drop()

if __name__ == '__main__':
    unittest.main()
