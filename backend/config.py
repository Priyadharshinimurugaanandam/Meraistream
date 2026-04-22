import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, '..', 'public', 'uploads', 'videos'))
LOG_FOLDER    = os.path.abspath(os.path.join(BASE_DIR, '..', 'public', 'uploads', 'logs'))
DB_FILE       = os.path.join(BASE_DIR, 'videos_db.json')
DB_SQLITE     = os.path.join(BASE_DIR, 'logs.db')

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
MAX_FILE_SIZE      = 2 * 1024 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(LOG_FOLDER,    exist_ok=True)

print(f"[config] UPLOAD_FOLDER : {UPLOAD_FOLDER}")
print(f"[config] LOG_FOLDER    : {LOG_FOLDER}")
print(f"[config] DB_SQLITE     : {DB_SQLITE}")