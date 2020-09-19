import mongoDBInterface
from model.user import User


# Tests whether or not setting up a user works
def test_setup_user():
    my_user = User("David", "Chen", "dchen@testmail.com", [])
    first_name = my_user.first_name == "David"
    last_name = my_user.last_name == "Chen"
    email = my_user.email == "dchen@testmail.com"
    assert (first_name & last_name & email)


# # Tests if created user is persisted to database
# def test_create_user_persist():
#     my_user = User("User", "User", "user@testmail.com", [])
#     my_user.create_user_db()
#     col = mongoDBInterface.get_col("Users", "users")
#     assert (col.find(my_user.__dict__))
#
#
# def setup_module():
#     col = mongoDBInterface.get_col("Test", "users")
#     col.drop()
