from model.user import User


def test_setup_user():
    my_user = User("David", "Chen", "dchen@testmail.com", [])
    first_name = my_user.first_name == "David"
    last_name = my_user.last_name == "Chen"
    email = my_user.email == "dchen@testmail.com"
    assert(first_name & last_name & email)
