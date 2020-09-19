from bson import ObjectId
from flask import Blueprint, request, make_response

from model.document import Document, get_db_collection
from model.label import Label
from mongoDBInterface import get_col

document_api = Blueprint('document_api', __name__)

@document_api.route('/document/create', methods=['Post'])
# Creating a new document!
def create_document():
    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'status_code': 400,
                    'message': "Missing project"}
        response = make_response(response)
        return response
    if 'content' in request.json:
        content = request.json['content']
    else:
        response = {'status_code': 400,
                    'message': "Missing content"}
        response = make_response(response)
        return response

    doc = Document(content, [], [])
    doc.data = content
    doc.upload(project)
    return '', 204


@document_api.route('/document/get', methods=['Get'])
# Getting a document!
def get_document():
    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'status_code': 400,
                    'message': "Missing project"}
        response = make_response(response)
        return response
    if 'id' in request.json:
        identifier = request.json['id']
    else:
        response = {'status_code': 400,
                    'message': "Missing content"}
        response = make_response(response)
        return response

    col = get_db_collection(project, "documents")
    print(identifier)
    doc = col.find_one({'_id': ObjectId(identifier)}, {'_id': 0})
    response = {'document': doc}
    response = make_response(response)
    return response, 200


# Endpoint to allow adding of labels to a document
@document_api.route('/document/label', methods=['Post'])
def add_label():
    if 'project' in request.json:
        project = request.json['project']
    else:
        response = {'status_code': 400,
                    'message': "Missing projectID"}
        response = make_response(response)
        return response
    if 'id' in request.json:
        identifier = request.json['id']
    else:
        response = {'status_code': 400,
                    'message': "Missing identifier"}
        response = make_response(response)
        return response

    if 'email' in request.json:
        email = request.json['email']
    else:
        response = {'status_code': 400,
                    'message': "Missing email"}
        response = make_response(response)
        return response

    if 'label' in request.json:
        label = request.json['label']
    else:
        response = {'status_code': 400,
                    'message': "Missing label"}
        response = make_response(response)
        return response

    doc = Document(identifier)

    return '', 204

<<<<<<< HEAD
=======

>>>>>>> 8647623... refactored latest merge
if __name__ == '__main__':
    project = "New_Project"
    identifier = "5f6578baa50829d1e7115498"
    col = get_db_collection(project, "documents")
    doc = col.find_one({'_id': ObjectId(identifier)})
    print(doc)



