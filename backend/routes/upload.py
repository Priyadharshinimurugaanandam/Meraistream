from flask import Blueprint, request, jsonify
from datetime import datetime
from database import add_video, save_log
from utils.file_handler import allowed_file, save_video_file
from utils.log_parser import parse_log_file
from werkzeug.utils import secure_filename
from config import LOG_FOLDER
import os

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/api/upload', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(video_file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: mp4, avi, mov, mkv, webm'}), 400

        title       = request.form.get('title', '').strip()
        procedure   = request.form.get('procedure', '').strip()
        dest_type   = request.form.get('destType', '').strip()
        dest_id     = request.form.get('destId', '').strip()
        dest_name   = request.form.get('destName', '').strip()
        uploaded_by = request.form.get('uploadedBy', 'Service Person').strip()
        dest_type_2 = request.form.get('destType2', '').strip()
        dest_id_2   = request.form.get('destId2', '').strip()
        dest_name_2 = request.form.get('destName2', '').strip()

        print(f"[upload] title={title}  procedure={procedure}  dest_type={dest_type}  dest_name={dest_name}")

        if not all([title, procedure, dest_type, dest_name]):
            missing = [k for k, v in {
                'title': title, 'procedure': procedure,
                'destType': dest_type, 'destName': dest_name
            }.items() if not v]
            return jsonify({'error': f'Missing required fields: {missing}'}), 400

        unique_filename, filepath, video_url = save_video_file(video_file)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        video_id  = f"v_{timestamp}"

        base = {
            'title':      title,
            'procedure':  procedure,
            'uploadedAt': datetime.now().strftime('%d %b %Y'),
            'uploadedBy': uploaded_by,
            'videoURL':   video_url,
            'fileName':   unique_filename,
            'views':      0,
        }

        entries_created = []

        # First destination — always required
        id_1 = f"{video_id}_1"
        add_video({
            **base,
            'id':              id_1,
            'destinationName': dest_name,
            'destinationType': dest_type,
        })
        entries_created.append({'id': id_1, 'type': dest_type, 'name': dest_name})

        # Second destination — optional
        if dest_type_2 and dest_name_2:
            id_2 = f"{video_id}_2"
            add_video({
                **base,
                'id':              id_2,
                'destinationName': dest_name_2,
                'destinationType': dest_type_2,
            })
            entries_created.append({'id': id_2, 'type': dest_type_2, 'name': dest_name_2})

        # Optional log file
        has_log  = False
        log_file = request.files.get('log')
        if log_file and log_file.filename.endswith('.json'):
            ts           = datetime.now().strftime('%Y%m%d_%H%M%S')
            safe_name    = secure_filename(log_file.filename)
            log_filename = f"{ts}_{safe_name}"
            log_filepath = os.path.join(LOG_FOLDER, log_filename)
            log_file.save(log_filepath)
            parsed = parse_log_file(log_filepath)
            for entry in entries_created:
                save_log(
                    video_id      = entry['id'],
                    file_name     = log_filename,
                    original_name = log_file.filename,
                    parsed_data   = parsed,
                )
            has_log = True

        print(f"[upload] ✅ Done — entries: {[e['id'] for e in entries_created]}")
        return jsonify({
            'success':  True,
            'message':  'Video uploaded successfully',
            'videoURL': video_url,
            'hasLog':   has_log,
            'entries':  entries_created,
        }), 200

    except Exception as e:
        print(f"[upload_video] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500