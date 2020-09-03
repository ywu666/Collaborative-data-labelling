from flask import Flask, request, make_response
from flask_cors import CORS
from model.project import Project
from mongoDBInterface import db

app = Flask(__name__)
cors = CORS(app)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"

#endpoint to add/delete/get preset labels
@app.route('/presetlabels', methods=['POST', 'GET', 'DELETE'])
def presetLabels():
    label_present = False
    #make sure project id is passed
    if 'projectName' in request.form:
        project_name = str(request.form['projectName'])
        labels = db.get_col(project_name, "Labels")
        label = request.json['label']
        if (request.method == 'GET'):
            return labels
        #identify if passed label is already in the preset list
        if label in labels:
            label_present = True
        if (request.method == 'POST'):
            if label_present:
                response = {'status_code': 400, 'message':"Label already set"}
            else:
                response = {'status_code': 200, 'message':"Added label successfully"}
                labels.append(label)
            response = make_response(response)
            return response
        if(request.method == 'DELETE'):
            if label_present:
                labels.remove(label)
                response = {'status_code': 200, 'message': "Label deleted successfully"}
            else:
                response = {'status_code': 400, 'message': "Label was not set"}
            response = make_response(response)
            return response
    else:
        response = {'status_code': 400,
                    'message': 'No project id provided'}
        response = make_response(response)
        return response 

if __name__ == '__main__':
    app.run()
