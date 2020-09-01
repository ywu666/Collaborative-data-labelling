from bson import ObjectId
from flask import Flask, request, make_response
from flask_cors import CORS
from numpy.core.defchararray import isnumeric

from backend.model.document import Document
from backend.model.project import Project

app = Flask(__name__)
cors = CORS(app)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'projectID' in request.json:
            project_id = ObjectId(request.json['projectID'])

            if 'inputFile' not in request.files:
                response = {'status_code': 400,
                            'message': 'No file selected'}
                response = make_response(response)
                return response

            file = request.files['inputFile']
            if file.filename == '':
                response = {'status_code': 400,
                            'message': 'No file selected'}
                response = make_response(response)
                return response
            if file:
                documents_to_import = file.readlines()

                # Find project database and populate document collection
                project = Project(project_id, [], [])
                for d in documents_to_import:
                    if isnumeric(d[0]):
                        project.add_document(Document(int(d[0]), d[1]))
                
                response = {'status_code': 200,
                            'message': 'Documents imported successfully'}
                return make_response(response)
        else:
            response = {'status_code': 400,
                        'message': 'No project id provided'}
            response = make_response(response)
            return response


if __name__ == '__main__':
    app.run()
