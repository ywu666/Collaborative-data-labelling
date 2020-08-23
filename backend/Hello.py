from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)


@app.route('/hello', methods=['Get'])
def hello():
    return "hello world"


if __name__ == '__main__':
    app.run()
