from mongoDBInterface import get_db_client
from mongoDBInterface import get_col


# Tests whether or not getting a collection works
def test_get_collection_db():
    labels = get_col("Test", "labels")
    label = labels.find_one()
    print(label)
    assert label['name'] == "Music"
