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
    def test_create_project_persisted(selfN):
        my_proj = Project("New Project", [], [])
        my_proj.add_project()
        col = mongoDBInterface.get_col("Test", "projects")
        assert (col.find(my_proj.__dict__))

    def test_update_labels(self):
        col = mongoDBInterface.get_col("Test", "projects")

        my_proj = Project("New Project", [], [])
        my_proj.add_project()

        updated_labels = [Label("Bug").__dict__, Label("Comment").__dict__]
        my_proj.set_labels(my_proj._id, updated_labels)

        updated_project = col.find_one({"_id": my_proj._id})
        assert (updated_project["preset_labels"] == updated_labels)


if __name__ == '__main__':
    unittest.main()



