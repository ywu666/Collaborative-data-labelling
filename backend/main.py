from flask import Flask
from flask_cors import CORS
from model.project import Project

app = Flask(__name__)
cors = CORS(app)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"

#endpoint to add/delete/get preset labels
@app.route('/presetlabels', methods=['POST', 'GET', 'DELETE'])
def presetLabels():
    requestPresent = False
    if (request.method == 'GET'):
        return Project.preset_labels
    for labels in Project.preset_labels:
        if (labels == Label(request.json['label'])):
            requestPresent = True
    if (request.method == 'POST'):
        if requestPresent:
            response = {'status_code': 400, 'message':"Label already set"}
        else:
            response = {'status_code': 200, 'message':"Added label successfully"}
            Project.preset_labels.append(request.json['label'])
        response = make_response(response)
        return response
    if(request.method == 'DELETE'):
        if requestPresent:
            Project.preset_labels.remove(request.json['label'])
            response = {'status_code': 200, 'message': "Label deleted successfully"}
        else:
            response = {'status_code': 400, 'message': "Label was not set"}
        response = make_response(response)
        return response
                
if __name__ == '__main__':
    app.run()
