from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    #config
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  #50mb max file size
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

    #create uploads directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    #enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    #register blueprints
    from backend.routes.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
