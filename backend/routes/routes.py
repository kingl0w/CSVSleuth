from flask import Blueprint, request, jsonify, send_file
import os
import uuid
from werkzeug.utils import secure_filename
import pandas as pd

from backend.scripts.csv_validator import CSVValidator
from backend.scripts.data_cleaner import DataCleaner
from backend.scripts.data_analyzer import DataAnalyzer
from backend.scripts.visualizer import DataVisualizer
from backend.config.config import Config

api_bp = Blueprint('api', __name__)

#store processed data temporarily (in production, use Redis or database)
processed_data_store = {}


@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle CSV file upload, validation, cleaning, and analysis"""

    #check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    #validate file extension
    if not CSVValidator.allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only CSV files are allowed'}), 400

    try:
        #create secure filename and save temporarily
        session_id = str(uuid.uuid4())
        original_filename = secure_filename(file.filename)
        upload_folder = Config.UPLOAD_FOLDER

        #ensure upload folder exists
        os.makedirs(upload_folder, exist_ok=True)

        temp_filepath = os.path.join(upload_folder, f"{session_id}_{original_filename}")
        file.save(temp_filepath)

        #validate and load CSV
        is_valid, error_message, df = CSVValidator.validate_csv(temp_filepath)

        if not is_valid:
            os.remove(temp_filepath)  #clean up
            return jsonify({'error': error_message}), 400

        #clean the data
        cleaner = DataCleaner(df)
        cleaned_df, cleaning_report = cleaner.clean()

        #analyze the data
        analyzer = DataAnalyzer(cleaned_df)
        analysis_results = analyzer.analyze()

        #generate visualizations
        visualizer = DataVisualizer(cleaned_df)
        visualizations = visualizer.generate_visualizations()

        #save cleaned CSV for download
        cleaned_filepath = os.path.join(upload_folder, f"{session_id}_cleaned.csv")
        cleaned_df.to_csv(cleaned_filepath, index=False)

        #store data for later retrieval
        processed_data_store[session_id] = {
            'original_file': temp_filepath,
            'cleaned_file': cleaned_filepath,
            'original_filename': original_filename,
            'dataframe': cleaned_df
        }

        #prepare preview data (first 100 rows)
        preview_data = cleaned_df.head(100).to_dict('records')

        #clean up nan values for json serialization
        preview_data = _clean_for_json(preview_data)

        #build response
        response = {
            'session_id': session_id,
            'original_filename': original_filename,
            'cleaning_report': cleaning_report,
            'analysis': analysis_results,
            'visualizations': visualizations,
            'preview_data': preview_data,
            'preview_columns': cleaned_df.columns.tolist(),
            'total_rows': len(cleaned_df)
        }

        return jsonify(response), 200

    except Exception as e:
        #clean up files if they exist
        if 'temp_filepath' in locals() and os.path.exists(temp_filepath):
            os.remove(temp_filepath)

        return jsonify({'error': f'Error processing file: {str(e)}'}), 500


@api_bp.route('/download/<session_id>', methods=['GET'])
def download_cleaned_file(session_id):
    """Download the cleaned CSV file"""

    if session_id not in processed_data_store:
        return jsonify({'error': 'Session not found or expired'}), 404

    try:
        data = processed_data_store[session_id]
        cleaned_file = data['cleaned_file']
        original_filename = data['original_filename']

        #create download filename
        download_filename = f"cleaned_{original_filename}"

        return send_file(
            cleaned_file,
            mimetype='text/csv',
            as_attachment=True,
            download_name=download_filename
        )

    except Exception as e:
        return jsonify({'error': f'Error downloading file: {str(e)}'}), 500


@api_bp.route('/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Clean up uploaded and processed files"""

    if session_id not in processed_data_store:
        return jsonify({'message': 'Session not found'}), 404

    try:
        data = processed_data_store[session_id]

        #remove files
        if os.path.exists(data['original_file']):
            os.remove(data['original_file'])
        if os.path.exists(data['cleaned_file']):
            os.remove(data['cleaned_file'])

        #remove from store
        del processed_data_store[session_id]

        return jsonify({'message': 'Session cleaned up successfully'}), 200

    except Exception as e:
        return jsonify({'error': f'Error cleaning up: {str(e)}'}), 500


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CSV Analyzer API is running'
    }), 200


def _clean_for_json(data):
    """Clean data for JSON serialization (handle NaN, infinity, etc.)"""
    import math

    if isinstance(data, list):
        return [_clean_for_json(item) for item in data]
    elif isinstance(data, dict):
        return {key: _clean_for_json(value) for key, value in data.items()}
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    else:
        return data
