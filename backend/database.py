import json
import os
import sqlite3
from datetime import datetime
from config import DB_SQLITE


def get_sqlite_conn():
    conn = sqlite3.connect(DB_SQLITE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_sqlite():
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.executescript('''
        CREATE TABLE IF NOT EXISTS videos (
            id               TEXT PRIMARY KEY,
            title            TEXT NOT NULL DEFAULT '',
            procedure        TEXT DEFAULT '',
            uploaded_by      TEXT DEFAULT '',
            uploaded_at      TEXT DEFAULT '',
            video_url        TEXT DEFAULT '',
            file_name        TEXT DEFAULT '',
            destination      TEXT DEFAULT '',
            destination_type TEXT DEFAULT '',
            views            INTEGER DEFAULT 0,
            created_at       TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS video_logs (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id      TEXT NOT NULL,
            file_name     TEXT NOT NULL,
            original_name TEXT,
            uploaded_at   TEXT NOT NULL,
            parsed_data   TEXT NOT NULL,
            FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        );
    ''')
    conn.commit()
    conn.close()
    print(f"[DB] Initialized at : {DB_SQLITE}")
    print(f"[DB] File exists    : {os.path.exists(DB_SQLITE)}")


# ── Video helpers ─────────────────────────────────────────────────────────────

def load_videos():
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute('SELECT * FROM videos ORDER BY created_at DESC')
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return [{
        'id':              r['id'],
        'title':           r['title'],
        'procedure':       r['procedure'],
        'uploadedBy':      r['uploaded_by'],
        'uploadedAt':      r['uploaded_at'],
        'videoURL':        r['video_url'],
        'fileName':        r['file_name'],
        'destinationName': r['destination'],
        'destinationType': r['destination_type'],
        'views':           r['views'],
    } for r in rows]


def add_video(video_data: dict):
    print(f"[add_video] Inserting id={video_data.get('id')}  title={video_data.get('title')}  type={video_data.get('destinationType')}")
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    try:
        cur.execute('''
            INSERT OR REPLACE INTO videos
                (id, title, procedure, uploaded_by, uploaded_at,
                 video_url, file_name, destination, destination_type, views)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            video_data.get('id'),
            video_data.get('title', ''),
            video_data.get('procedure', ''),
            video_data.get('uploadedBy', ''),
            video_data.get('uploadedAt', ''),
            video_data.get('videoURL', ''),
            video_data.get('fileName', ''),
            video_data.get('destinationName', ''),
            video_data.get('destinationType', ''),
            video_data.get('views', 0),
        ))
        conn.commit()
        print(f"[add_video] ✅ Committed id={video_data.get('id')}")
    except Exception as e:
        print(f"[add_video] ❌ Failed: {e}")
        raise
    finally:
        conn.close()


def find_video_by_id(video_id: str):
    videos = load_videos()
    return next((v for v in videos if v['id'] == video_id), None)


def remove_video_by_id(video_id: str):
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute('DELETE FROM videos WHERE id = ?', (video_id,))
    deleted = cur.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def save_videos(videos):
    for v in videos:
        add_video(v)


# ── Log helpers ───────────────────────────────────────────────────────────────

def save_log(video_id: str, file_name: str, original_name: str, parsed_data: dict):
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute('DELETE FROM video_logs WHERE video_id = ?', (video_id,))
    cur.execute('''
        INSERT INTO video_logs (video_id, file_name, original_name, uploaded_at, parsed_data)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        video_id,
        file_name,
        original_name,
        datetime.now().isoformat(),
        json.dumps(parsed_data),
    ))
    conn.commit()
    conn.close()
    print(f"[save_log] ✅ Log saved for video_id={video_id}")


def get_log_by_video_id(video_id: str):
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute(
        'SELECT * FROM video_logs WHERE video_id = ? ORDER BY id DESC LIMIT 1',
        (video_id,)
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    data['parsed_data'] = json.loads(data['parsed_data'])
    return data


def delete_log_by_video_id(video_id: str):
    conn = get_sqlite_conn()
    cur  = conn.cursor()
    cur.execute('DELETE FROM video_logs WHERE video_id = ?', (video_id,))
    conn.commit()
    conn.close()