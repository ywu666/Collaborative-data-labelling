from backend import mongoDBInterface
from backend.model.document import Document
from backend.model.label import Label
from backend.model.project import Project


# Tests whether setting up a a project works
def test_setup_project():
    name = "test_project"
    preset_labels = []
    documents = []
    my_proj = Project(name, preset_labels, documents)
    assert (my_proj.name == name)


# Test persistence of new project in database
def test_create_project_persisted():
    my_proj = Project("New_Project", [], [])
    my_proj.create_project()
    client = mongoDBInterface.get_db_client()
    db_names = client.list_database_names()

    assert (db_names.__contains__("New_Project"))


# Tests setting predefined labels
def test_set_labels():
    my_proj = Project("New_Project", [], [])

    predefined_labels = [Label("Bug"), Label("Comment")]
    my_proj.set_labels(predefined_labels)

    col = mongoDBInterface.get_col("New_Project", "labels")
    assert (col.find_one({"name": "Bug"}))
    assert (col.find_one({"name": "Comment"}))


# Tests adding a single document
def test_add_document():
    my_proj = Project("New_Project", [], [])

    document = Document(1, "data")
    my_proj.add_document(document)

    col = mongoDBInterface.get_col("New_Project", "documents")
    assert (col.find_one({"identifier": 1}))


def setup_module():
    mongoDBInterface.get_col("New_Project", "documents").drop()
    mongoDBInterface.get_col("New_Project", "labels").drop()
    mongoDBInterface.get_col("New_Project", "users").drop()

    my_client = mongoDBInterface.get_db_client()
    my_client.drop_database("New_Project")


def teardown_method():
    mongoDBInterface.get_col("New_Project", "documents").drop()
    mongoDBInterface.get_col("New_Project", "labels").drop()
    mongoDBInterface.get_col("New_Project", "users").drop()
