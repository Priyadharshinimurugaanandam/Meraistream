from flask import Flask
from flask_cors import CORS
from config import UPLOAD_FOLDER, MAX_FILE_SIZE
from routes.upload import upload_bp
from routes.videos import videos_bp
from routes.logs   import logs_bp
from database      import init_sqlite


def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER']      = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

    CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers=[
        "Content-Range", "Content-Length", "Accept-Ranges"
    ])

    init_sqlite()

    app.register_blueprint(upload_bp)
    app.register_blueprint(videos_bp)
    app.register_blueprint(logs_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    print("[app] Server starting on http://localhost:3001")
    app.run(debug=True, host='0.0.0.0', port=3001)