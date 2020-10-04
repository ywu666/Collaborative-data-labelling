import json
from bson import ObjectId
from flask import make_response

from mongoDBInterface import get_col


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


def add_project_to_user(user_email, project_name):
    user_col = get_col("users", "users")
    user_col.update_one({"email": user_email}, {"$push": {"projects": project_name}})


def remove_project_from_user(user_email, project_name):
    user_col = get_col("users", "users")
    user_col.update_one({"email": user_email}, {"$pull": {"projects": project_name}})


def remove_all_labels_of_user(user_email, project_name):
    document_col = get_col(project_name, "documents")
    document_col.update(
        {
            "user_and_labels": {
                "$elemMatch": {
                    "email": user_email
                }
            }
        },
        {
            "$pull": {
                "user_and_labels": {
                    "email": user_email
                }
            }})


def update_user_document_label(col, email, document_id, label_id, labels_are_match):
    if labels_are_match:
        col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": email}}},
                       {'$set': {
                           "user_and_labels.$.label": ObjectId(label_id),
                           "user_and_labels.$.label_confirmed": labels_are_match,
                           "final_label": ObjectId(label_id)}
                       })
    else:
        col.update_one({'_id': ObjectId(document_id), "user_and_labels": {'$elemMatch': {"email": email}}},
                       {'$set': {
                           "user_and_labels.$.label": ObjectId(label_id),
                           "user_and_labels.$.label_confirmed": labels_are_match}
                       })


def create_user_document_label(col, email, document_id, label_id, labels_are_match):
    if labels_are_match:
        col.update_one({'_id': ObjectId(document_id)},
                       {'$push': {
                           "user_and_labels": {
                               "email": email,
                               "label": ObjectId(label_id),
                               "label_confirmed": labels_are_match}
                       },
                           '$set': {"final_label": ObjectId(label_id)}}
                       )
    else:
        col.update_one({'_id': ObjectId(document_id)},
                       {'$push': {
                           "user_and_labels": {
                               "email": email,
                               "label": ObjectId(label_id),
                               "label_confirmed": labels_are_match}
                       }
                       })


def check_all_labels_for_document_match(document):
    user_and_labels = document['user_and_labels']
    if len(user_and_labels) == 2:
        if user_and_labels[0]['label'] != user_and_labels[1]['label']:
            return False
        else:
            return True

    return False

  
def generate_response_for_getting_document_final_label_and_conflict_status(doc, document_id):
    if check_all_labels_for_document_match(doc):
        response = \
            {
                'document': document_id,
                'finalLabelConfirmed': True,
                'documentLabelConflicting': False
            }
    elif len(doc['user_and_labels']) == 2:
        if doc['user_and_labels'][0]['label_confirmed'] and doc['user_and_labels'][1]['label_confirmed']:
            if check_all_labels_for_document_match(doc):
                response = \
                    {
                        'document': document_id,
                        'finalLabelConfirmed': True,
                        'documentLabelConflicting': False
                    }
            else:
                response = \
                    {
                        'document': document_id,
                        'finalLabelConfirmed': True,
                        'documentLabelConflicting': True
                    }
        else:
            if check_all_labels_for_document_match(doc):
                response = \
                    {
                        'document': document_id,
                        'finalLabelConfirmed': False,
                        'documentLabelConflicting': False
                    }
            else:
                response = \
                    {
                        'document': document_id,
                        'finalLabelConfirmed': False,
                        'documentLabelConflicting': True
                    }
    else:
        response = {'message': "Not labelled by both contributors"}
        make_response(response)
        return response, 400

    return response

def get_label_name_by_label_id(label_col, label_id):
    label = label_col.find_one({"_id": ObjectId(label_id)})
    label = label['name']
    return label
