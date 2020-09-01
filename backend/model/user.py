import json
from pprint import pprint

from backend import mongoDBInterface


class User:
    def __init__(self, first_name, last_name, email, permissions):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.permissions = permissions

    def add_user(self):
        col = mongoDBInterface.get_col("Test", "users")
        print(self.__dict__)
        col.insert_one(self.__dict__)
