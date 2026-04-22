# migrate.py — run once from backend folder: python3 migrate.py
import os, json, sqlite3
from datetime import datetime
from config import DB_FILE, DB_SQLITE, LOG_FOLDER
from utils.log_parser import parse_log_file

conn = sqlite3.connect(DB_SQLITE)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# ── 1. Create new unified schema ──────────────────────────────────────────────
cur.executescript('''
    CREATE TABLE IF NOT EXISTS videos (
        id            TEXT PRIMARY KEY,
        title         TEXT NOT NULL,
        procedure     TEXT DEFAULT '',
        uploaded_by   TEXT DEFAULT '',
        uploaded_at   TEXT DEFAULT '',
        video_url     TEXT DEFAULT '',
        file_name     TEXT DEFAULT '',
        destination   TEXT DEFAULT '',
        views         INTEGER DEFAULT 0,
        created_at    TEXT DEFAULT CURRENT_TIMESTAMP
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
print("✓ Tables created")

# ── 2. Migrate videos_db.json → videos table ──────────────────────────────────
if os.path.exists(DB_FILE):
    with open(DB_FILE) as f:
        videos = json.load(f)

    migrated = 0
    for v in videos:
        cur.execute('SELECT id FROM videos WHERE id = ?', (v['id'],))
        if cur.fetchone():
            print(f"  SKIP video {v['id']} — already in SQLite")
            continue
        cur.execute('''
            INSERT INTO videos (id, title, procedure, uploaded_by, uploaded_at,
                                video_url, file_name, destination, views)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            v.get('id', ''),
            v.get('title', ''),
            v.get('procedure', ''),
            v.get('uploadedBy', ''),
            v.get('uploadedAt', ''),
            v.get('videoURL', ''),
            v.get('fileName', ''),
            v.get('destinationName', ''),
            v.get('views', 0),
        ))
        migrated += 1
    conn.commit()
    print(f"✓ Migrated {migrated} video(s) from videos_db.json")
else:
    print("✗ videos_db.json not found, skipping video migration")

# ── 3. Re-link log files → videos by timestamp match ─────────────────────────
# Log filename format:  20260422_121639_SurgeryType_date.json
# Video ID format:      v_20260422_121027_1
# Match on: date part YYYYMMDD being same or close

print(f"\nScanning log folder: {LOG_FOLDER}")
log_files = [f for f in os.listdir(LOG_FOLDER) if f.endswith('.json')]
print(f"Found {len(log_files)} log file(s)")

cur.execute('SELECT id, title, uploaded_at, file_name FROM videos')
all_videos = [dict(r) for r in cur.fetchall()]

repaired = 0
for log_fname in log_files:
    # Check if already linked
    cur.execute('SELECT id FROM video_logs WHERE file_name = ?', (log_fname,))
    if cur.fetchone():
        print(f"  SKIP {log_fname} — already linked")
        continue

    # Extract date prefix from log filename (first 8 chars = YYYYMMDD)
    log_date = log_fname[:8]  # e.g. "20260422"

    # Try to find a video whose ID contains the same date
    matched_video = None
    for v in all_videos:
        vid_date = v['id'].replace('v_', '')[:8]  # e.g. "20260422" from "v_20260422_120723_1"
        if vid_date == log_date:
            matched_video = v
            break

    if not matched_video:
        print(f"  SKIP {log_fname} — no video found for date {log_date}")
        continue

    # Parse and store
    log_path = os.path.join(LOG_FOLDER, log_fname)
    try:
        parsed = parse_log_file(log_path)
        # Remove existing log for this video first
        cur.execute('DELETE FROM video_logs WHERE video_id = ?', (matched_video['id'],))
        cur.execute('''
            INSERT INTO video_logs (video_id, file_name, original_name, uploaded_at, parsed_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            matched_video['id'],
            log_fname,
            log_fname,
            datetime.now().isoformat(),
            json.dumps(parsed),
        ))
        conn.commit()
        print(f"  OK   {log_fname} → '{matched_video['title']}' ({parsed.get('surgeon_name')}, {parsed.get('duration')})")
        repaired += 1
    except Exception as e:
        print(f"  ERR  {log_fname} → {e}")

print(f"\n✓ Linked {repaired} log(s)")

# ── 4. Summary ────────────────────────────────────────────────────────────────
cur.execute('SELECT COUNT(*) FROM videos')
vc = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM video_logs')
lc = cur.fetchone()[0]
cur.execute('''
    SELECT v.id, v.title, vl.file_name, vl.uploaded_at
    FROM videos v
    LEFT JOIN video_logs vl ON v.id = vl.video_id
''')
print(f"\n── Final state: {vc} video(s), {lc} log(s) ──")
for row in cur.fetchall():
    log_status = f"→ {row[2]}" if row[2] else "→ NO LOG"
    print(f"  {row[0]} | {row[1]} | {log_status}")

conn.close()