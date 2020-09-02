import os

import csv
from flask import Flask, request, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename

from backend.model.document import Document
from backend.model.project import Project

app = Flask(__name__)
cors = CORS(app)

# Create folder for temporarily storing files
uploads_dir = os.path.join('uploads')
os.makedirs(uploads_dir, exist_ok=True)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        print(request.form)
        print(request.files)

        if 'projectName' in request.form:
            project_id = str(request.form['projectName'])
            print(project_id)

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
                filename = secure_filename(file.filename)
                file.save(os.path.join(uploads_dir, filename))

                filelocation = os.path.join(uploads_dir, filename)

                with open(filelocation) as csv_file:
                    csv_reader = csv.reader(csv_file, delimiter=",")
                    line_count = 0

                    for row in csv_reader:
                        if line_count == 0:
                            line_count += 1
                        else:
                            print("current row: ", int(row[0]))
                            document = Document(int(row[0]), row[1])
                            # Find project database and populate document collection
                            project = Project(project_id, [], [])
                            project.add_document(document)

                            line_count += 1

                # Delete file when done
                os.remove(filelocation)

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
