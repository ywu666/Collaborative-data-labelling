# OR, explicitly providing path to '.env'
from pathlib import Path  # python3 only
import os
import pymongo

from dotenv import load_dotenv

def get_col(col):
    load_dotenv()
    ATLAS_URI = os.getenv("ATLAS_URI")
    myclient = pymongo.MongoClient(ATLAS_URI)
    return myclient["Test"][col]

if __name__ == '__main__':
    mycol = get_col("Labels")

