from mongoDBInterface import get_db_client
from mongoDBInterface import get_col


def test_get_collection_db():
    labels = get_col("Test", "labels")
    label = labels.find_one()
    assert label.name == "Music"
