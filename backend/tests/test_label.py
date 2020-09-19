import mongoDBInterface
from model.label import Label


# Tests whether or not setting up a label works
def test_setup_label():
    my_label = Label("Music")
    assert (my_label.name == "Music")
