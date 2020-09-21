from api import document_api, label_api, project_api, user_api, import_export_api
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(document_api.document_api)
app.register_blueprint(label_api.label_api)
app.register_blueprint(project_api.project_api)
app.register_blueprint(user_api.user_api)
app.register_blueprint(import_export_api.import_export_api)

cors = CORS(app)

if __name__ == '__main__':
    app.run()
