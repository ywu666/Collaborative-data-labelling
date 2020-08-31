import unittest

from backend.model.project import Project

class TestProject(unittest.TestCase):
    # Tests whether setting up a a project works
    def test_setup_project(self):
        name = "test_project"
        preset_labels = []
        documents = []
        my_proj = Project(name, preset_labels, documents)
        assert(my_proj.name == name)

if __name__ == '__main__':
    unittest.main()



