import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from routes import api

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-me')
    CORS(app, resources={r"/*": {"origins": os.getenv('CORS_ORIGIN', '*')}}, supports_credentials=True)

    # Register API
    app.register_blueprint(api, url_prefix='/api')
    
    # Root route
    @app.route('/')
    def root():
        return jsonify({
            'message': 'Ocean Emergency App Backend',
            'status': 'running',
            'version': '1.0.0',
            'api_endpoints': '/api/*',
            'health_check': '/health'
        })
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'service': 'Ocean Emergency Backend'})
    
    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')))
