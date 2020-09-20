from flask import Blueprint, request, make_response

from model.project import Project
from mongoDBInterface import get_col

label_api = Blueprint('label_api', __name__)


# endpoint to add/delete/get preset labels
@label_api.route('/label/preset', methods=['POST', 'GET', 'DELETE'])
def preset_labels():
    # make sure project id is passed
    if 'project' in request.json:
        project_name = str(request.json['project'])
        labels_col = get_col(project_name, "labels")
        labels_cursor = labels_col.find({})
        labels = list(labels_cursor)
        for l in labels:
            l['_id'] = str(l['_id'])

        if request.method == 'GET':
            response = {"labels": labels}
            response = make_response(response)
            return response, 200
        # identify if passed label is already in the preset list
        if 'label' in request.json:
            label = request.json['label']
            if labels_col.find_one({"name": label}) is not None:
                label_present = True
            else:
                label_present = False

            if request.method == 'POST':
                if label_present:
                    response = {'message': "Label already set"}
                    response = make_response(response)
                    return response, 400
                else:

                    labels_col.insert_one({"name": label})
                    response = {'message': "Added label successfully"}
                    response = make_response(response)
                    return response, 200

            if request.method == 'DELETE':
                if label_present:
                    labels_col.delete_one({"name": label})
                    response = {'message': "Label deleted successfully"}
                    response = make_response(response)
                    return response, 200
                else:
                    response = {'message': "Label was not set"}
                    response = make_response(response)
                    return response, 400
        else:
            response = {'message': 'No label value provided'}
            response = make_response(response)
            return response, 400
    else:
        response = {'message': 'No project id provided'}
        response = make_response(response)
        return response, 400
