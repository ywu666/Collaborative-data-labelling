# OR, explicitly providing path to '.env'
from enums.user_role import UserRole
import datetime
import os

from enums.project_state import ProjectState
from dotenv import load_dotenv

from flask import Flask
from flask_mongoengine import MongoEngine

db = MongoEngine()


def init_db(app):
    global db
    load_dotenv()
    ATLAS_URI = os.getenv("ATLAS_URI")
    app.config["MONGODB_HOST"] = ATLAS_URI
    db = MongoEngine(app)


class DataLabelResult(db.EmbeddedDocument):
    user = db.ReferenceField('User')
    label = db.StringField() 


class UserKey(db.EmbeddedDocument):
    en_private_key = db.StringField()
    salt = db.StringField()
    public_key = db.StringField()


class Collaborator(db.EmbeddedDocument):
    entry_key = db.StringField()
    user = db.ReferenceField('User')
    role = db.EnumField(UserRole)
    dataNumber = db.ListField()


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
    project_name = db.StringField(Required=True)
    state = db.EnumField(ProjectState, default=None)
    encryption_state = db.BooleanField(default=False)
    data = db.EmbeddedDocumentListField(Data)
    labels = db.EmbeddedDocumentListField(Label)
    collaborators = db.EmbeddedDocumentListField(Collaborator)
    agreement_scores = db.EmbeddedDocumentListField(AgreementScore)


class User(db.Document):
    username = db.StringField(Required=True)
    email = db.StringField(Required=True)
    projects = db.ListField(db.ReferenceField(Project))
    key = db.EmbeddedDocumentField(UserKey)
    notifications = db.ListField(db.ReferenceField(Notification))
