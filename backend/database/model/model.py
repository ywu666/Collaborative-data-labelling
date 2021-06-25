# OR, explicitly providing path to '.env'
import datetime
import os

from pathlib import Path
from typing import Tuple  # python3 only
from typing_extensions import Required
from backend.enum.projectState import ProjectState

import flask
from flask_mongoengine import MongoEngine

db = None

def get_init_db(app):
    global db
    if db is None:
        ATLAS_URI = os.getenv("ATLAS_URI")
        app.config["MONGO_URI"] = ATLAS_URI
        db = MongoEngine(app)
    return db

class DataLabelResult(db.EmbeddedDocument):
    user = db.ReferenceField('User')
    label = db.ReferenceField("Label")

class UserKey(db.EmbeddedDocument):
    en_private_key = db.StringField()
    salt = db.StringField()
    key_pair = db.StringField()

class Collaborator(db.EmbeddedDocument):
    entry_key = db.StringField()
    user = db.ReferenceField('User')
    role = db.StringField()

# one line of data that needs to be labelled 
class Data(db.EmbeddedDocument):
    display_id = db.IntField(Required=True)
    value = db.StringField(Required=True)
    labels = db.EmbeddedDocumentListField(DataLabelResult)
    final_label = db.StringField(default=None)

class Label(db.EmbeddedDocument):
    value = db.StringField(Required=True)

class AgreementScore(db.EmbeddedDocument):
    value = db.IntField(Required=True)
    date = db.DateTimeField(default=datetime.datetime.utcnow)
    round_number = db.IntField(default=0)

class Notification(db.Document):
    value = db.StringField(Required=True)

class Project(db.Document):
    name = db.StringField(Required=True)
    state = db.EnumField(ProjectState)  
    encryption_state = db.BooleanField(default=False)
    data = db.EmbeddedDocumentListField(Data)
    labels = db.EmbeddedDocumentListField(Label)
    collaborators = db.EmbeddedDocumentListField(Collaborator)
    agreement_scores = db.EmbeddedDocumentListField(AgreementScore)

class User(db.Document):    
    username = db.StringField()
    email = db.StringField(Required=True)
    projects = db.ListField(db.ReferenceField(Project))
    key = db.EmbeddedDocument(UserKey)
    notifications = db.ListField(db.ReferenceField(Notification))

# def get_col(proj, col):
#     myclient = get_db_client()
#     return myclient[proj][col]


# def create_db_for_proj(proj_name):
#     myclient = get_db_client()
#     mydb = myclient[proj_name]
#     mydb.create_collection("users")
#     mydb.create_collection("documents")
#     mydb.create_collection("labels")


# if __name__ == '__main__':
#     mycol = get_col("Test", "Labels")
#     print(mycol.find_one())
#     create_db_for_proj("Test")
