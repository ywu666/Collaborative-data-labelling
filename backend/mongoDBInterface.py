# OR, explicitly providing path to '.env'
from pathlib import Path  # python3 only
import os
import pymongo

from dotenv import load_dotenv


def get_db_client():
    load_dotenv()
    ATLAS_URI = os.getenv("ATLAS_URI")
    myclient = pymongo.MongoClient(ATLAS_URI)
    return myclient


def get_col(proj, col):
    myclient = get_db_client()
    return myclient[proj][col]


def create_db_for_proj(proj_name):
    myclient = get_db_client()
    mydb = myclient[proj_name]
    mydb.create_collection("users")
    mydb.create_collection("documents")
    mydb.create_collection("labels")


if __name__ == '__main__':
    mycol = get_col("Test", "Labels")
    print(mycol.find_one())
    create_db_for_proj("Test")

