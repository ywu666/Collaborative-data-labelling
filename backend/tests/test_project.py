import unittest
from typing import List

from bson import ObjectId

from backend import mongoDBInterface
from backend.model.label import Label
from backend.model.project import Project

class TestProject(unittest.TestCase):
    # Tests whether setting up a a project works
    def test_setup_project(self):
        name = "test_project"
        preset_labels = []
        documents = []
        my_proj = Project(name, preset_labels, documents)
        assert(my_proj.name == name)

    # Test persistence of new project in database
    def test_create_project_persisted(self):
        my_proj = Project("New_Project", [], [])
        my_proj.create_project()
        client = mongoDBInterface.get_db_client()
        db_names = client.list_database_names()

        assert (db_names.__contains__("New_Project"))

    def test_set_labels(self):
        my_proj = Project("New_Project", [], [])

        predefined_labels = [Label("Bug"), Label("Comment")]
        my_proj.set_labels(predefined_labels)

        col = mongoDBInterface.get_col("New_Project", "labels")
        assert (col.find_one({"name": "Bug"}))
        assert (col.find_one({"name": "Comment"}))


if __name__ == '__main__':
    unittest.main()



