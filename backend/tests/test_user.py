import unittest

from backend import mongoDBInterface
from backend.model.user import User


class TestUser(unittest.TestCase):
    # Tests whether or not setting up a user works
    def test_setup_user(self):
        my_user = User("David", "Chen", "dchen@testmail.com", [])
        first_name = my_user.first_name == "David"
        last_name = my_user.last_name == "Chen"
        email = my_user.email == "dchen@testmail.com"
        assert (first_name & last_name & email)

    # Tests if created user is persisted to database
    def test_create_user_persist(self):
        my_user = User("User", "User", "user@testmail.com", [])

        my_user.add_user()
        col = mongoDBInterface.get_col("Test", "Users")
        assert (col.find(my_user.__dict__))


if __name__ == '__main__':
    unittest.main()
