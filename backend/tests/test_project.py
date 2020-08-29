from model.project import Project


# Tests whether setting up a a project works
def test_setup_project():
    name = "test_project"
    preset_labels = []
    documents = []
    my_proj = Project(name, preset_labels, documents)
    assert(my_proj.name == name)




