from flask import Flask, request, make_response
from flask_cors import CORS
from backend.model.label import Label

app = Flask(__name__)
cors = CORS(app)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"

#Endpoint to allow adding of labels to a document
@app.route('/addlabel', methods=['Post'])
def addLabel():
    if 'projectID' in request.json:
        projectID = int(request.json['projectID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing projectID"}
        response = make_response(response)
        return response

    if 'documentID' in request.json:
        documentID = int(request.json['documentID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing documentID"}
        response = make_response(response)
        return response

    if 'userID' in request.json:
        userID = int(request.json['userID'])
    else:
        response = {'status_code': 400,
                    'message': "Missing userID"}
        response = make_response(response)
        return response

    if 'label' in request.json:
        label = Label(request.json['label'])
    else:
        response = {'status_code': 400,
                    'message': "Missing label"}
        response = make_response(response)
        return response

    ### Check user permisisions for project ###
    ### Add to DB ###

    response = {'status_code': 200,
                'message': "Added label succesfully"}
    response = make_response(response)
    return response


if __name__ == '__main__':
    app.run()
