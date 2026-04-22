import os
from config import UPLOAD_FOLDER, LOG_FOLDER, ALLOWED_EXTENSIONS
from werkzeug.utils import secure_filename
from datetime import datetime

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_video_file(file):
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_filename = f"{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    video_url = f"/uploads/videos/{unique_filename}"
    return unique_filename, filepath, video_url

def delete_video_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    print(f"Attempting to delete: {filepath}")
    print(f"File exists: {os.path.exists(filepath)}")
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f"Deleted: {filepath}")
        return True
    print(f"File NOT found: {filepath}")
    return False

def delete_log_file(filename):
    filepath = os.path.join(LOG_FOLDER, filename)
    print(f"Attempting to delete log: {filepath}")
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f"Deleted log: {filepath}")
        return True
    print(f"Log file NOT found: {filepath}")
    return False

def get_mime_type(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    mime_map = {
        'mp4':  'video/mp4',
        'webm': 'video/webm',
        'mkv':  'video/x-matroska',
        'avi':  'video/x-msvideo',
        'mov':  'video/quicktime',
    }
    return mime_map.get(ext, 'video/mp4')