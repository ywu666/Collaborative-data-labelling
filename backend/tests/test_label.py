from model.label import Label


def test_setup_label():
    my_label = Label("Music")
    assert(my_label.name == "Music")
