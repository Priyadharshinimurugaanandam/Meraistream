from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from database import find_video_by_id, save_log, get_log_by_video_id, delete_log_by_video_id
from utils.log_parser import parse_log_file
from config import LOG_FOLDER
import os

logs_bp = Blueprint('logs', __name__)


@logs_bp.route('/api/videos/<video_id>/log', methods=['POST'])
def upload_log(video_id):
    try:
        video = find_video_by_id(video_id)
        if not video:
            return jsonify({'error': 'Video not found'}), 404

        if 'log' not in request.files:
            return jsonify({'error': 'No log file provided'}), 400

        log_file = request.files['log']
        if not log_file.filename.endswith('.json'):
            return jsonify({'error': 'Only .json files supported'}), 400

        ts           = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_name    = secure_filename(log_file.filename)
        log_filename = f"{ts}_{safe_name}"
        log_filepath = os.path.join(LOG_FOLDER, log_filename)
        log_file.save(log_filepath)

        parsed = parse_log_file(log_filepath)
        save_log(
            video_id      = video_id,
            file_name     = log_filename,
            original_name = log_file.filename,
            parsed_data   = parsed,
        )

        return jsonify({
            'success':      True,
            'message':      'Log uploaded and parsed',
            'instruments':  len(parsed.get('instruments', [])),
            'clutch_count': parsed.get('clutch_count', 0),
        }), 200

    except Exception as e:
        print(f"[upload_log] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


@logs_bp.route('/api/videos/<video_id>/log', methods=['GET'])
def get_log(video_id):
    try:
        row = get_log_by_video_id(video_id)
        if not row:
            return jsonify({'hasLog': False, 'instruments': [], 'clutch_count': 0}), 200

        parsed = row['parsed_data']
        return jsonify({
            'hasLog':       True,
            'uploadedAt':   row['uploaded_at'],
            'originalName': row['original_name'],
            **parsed,
        }), 200

    except Exception as e:
        print(f"[get_log] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


@logs_bp.route('/api/videos/<video_id>/log', methods=['DELETE'])
def delete_log(video_id):
    try:
        delete_log_by_video_id(video_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"[delete_log] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500