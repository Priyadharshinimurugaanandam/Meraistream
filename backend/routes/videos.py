from flask import Blueprint, jsonify, request, Response
import os
from database import load_videos, find_video_by_id, remove_video_by_id, delete_log_by_video_id
from utils.file_handler import delete_video_file, get_mime_type
from config import UPLOAD_FOLDER

videos_bp = Blueprint('videos', __name__)


@videos_bp.route('/api/videos', methods=['GET'])
def get_videos():
    try:
        videos = load_videos()
        print(f"[get_videos] Returning {len(videos)} videos")
        return jsonify(videos), 200
    except Exception as e:
        print(f"[get_videos] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


@videos_bp.route('/api/videos/<video_id>', methods=['DELETE'])
def delete_video(video_id):
    try:
        video = find_video_by_id(video_id)
        if not video:
            return jsonify({'error': 'Video not found'}), 404

        filename     = video.get('fileName')
        file_deleted = delete_video_file(filename) if filename else False

        delete_log_by_video_id(video_id)
        remove_video_by_id(video_id)

        return jsonify({
            'success':      True,
            'message':      'Video deleted successfully',
            'file_deleted': file_deleted,
        }), 200

    except Exception as e:
        print(f"[delete_video] ❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


@videos_bp.route('/api/debug', methods=['GET'])
def debug():
    try:
        videos = load_videos()
        return jsonify({'count': len(videos), 'videos': videos}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@videos_bp.route('/uploads/videos/<filename>', methods=['GET', 'OPTIONS'])
def serve_video(filename):
    if request.method == 'OPTIONS':
        response = Response()
        response.headers['Access-Control-Allow-Origin']  = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Range, Content-Type'
        return response, 200

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': f'File not found: {filename}'}), 404

    file_size    = os.path.getsize(filepath)
    mime_type    = get_mime_type(filename)
    range_header = request.headers.get('Range', None)

    if not range_header:
        def generate_full():
            with open(filepath, 'rb') as f:
                while True:
                    chunk = f.read(1024 * 1024)
                    if not chunk:
                        break
                    yield chunk

        response = Response(generate_full(), status=200, mimetype=mime_type)
        response.headers['Content-Length']                = str(file_size)
        response.headers['Accept-Ranges']                 = 'bytes'
        response.headers['Access-Control-Allow-Origin']   = '*'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges'
        return response

    try:
        range_value          = range_header.strip().replace('bytes=', '')
        range_start, range_end = range_value.split('-')
        start = int(range_start)
        end   = int(range_end) if range_end.strip() else file_size - 1
        end   = min(end, file_size - 1)

        if start > end or start >= file_size:
            response = Response(status=416)
            response.headers['Content-Range'] = f'bytes */{file_size}'
            return response

        chunk_size    = end - start + 1
        content_range = f'bytes {start}-{end}/{file_size}'

        def generate_partial():
            with open(filepath, 'rb') as f:
                f.seek(start)
                remaining = chunk_size
                while remaining > 0:
                    read_size = min(1024 * 1024, remaining)
                    data      = f.read(read_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        response = Response(generate_partial(), status=206, mimetype=mime_type)
        response.headers['Content-Range']                 = content_range
        response.headers['Content-Length']                = str(chunk_size)
        response.headers['Accept-Ranges']                 = 'bytes'
        response.headers['Access-Control-Allow-Origin']   = '*'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges'
        return response

    except Exception as e:
        return jsonify({'error': f'Range error: {str(e)}'}), 416


@videos_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200