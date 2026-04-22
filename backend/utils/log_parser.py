import json
import os


def parse_log_file(filepath: str) -> dict:
    """
    Parse a surgical JSON log file and extract:
    - surgery metadata (type, surgeon, patient, duration)
    - instruments (name, duration, count, arm)
    - clutch presses (total count)
    """
    with open(filepath, 'r') as f:
        events = json.load(f)

    result = {
        'surgery_type':  '',
        'surgeon_name':  '',
        'patient_info':  '',
        'surgery_start': '',
        'surgery_stop':  '',
        'duration':      '',
        'clutch_count':  0,
        'instruments':   [],
    }

    # ── Count clutch presses ──────────────────────────────────────────────────
    result['clutch_count'] = sum(
        1 for e in events if e.get('event') == 'Clutch Pedal Pressed'
    )

    # ── Surgery metadata ──────────────────────────────────────────────────────
    for e in events:
        ev = e.get('event', '')
        val = e.get('value', '')
        if ev == 'Surgery type selected':  result['surgery_type']  = val
        elif ev == 'Surgeon Name':         result['surgeon_name']  = val
        elif ev == 'Patient Info':         result['patient_info']  = val
        elif ev == 'Surgery started':      result['surgery_start'] = val
        elif ev == 'Surgery stopped':      result['surgery_stop']  = val
        elif ev == 'Surgery duration':     result['duration']      = val

    # ── Parse instruments in order ────────────────────────────────────────────
    # Walk through events sequentially, group Name → Count → Duration triplets
    instruments_raw = []
    i = 0
    while i < len(events):
        ev = events[i].get('event', '')

        # Check if this event is an instrument Name event
        if 'Instrument Name' in ev:
            arm  = 'Left' if 'Left' in ev else 'Right'
            name = events[i].get('value', '')
            count    = None
            duration = None

            # Look ahead for matching Count and Duration
            j = i + 1
            while j < len(events) and j <= i + 4:
                nev = events[j].get('event', '')
                if f'Primary{arm} Instrument Count is' in nev:
                    count = events[j].get('value', '0')
                elif f'Primary{arm} Instrument Connected duration is' in nev:
                    duration = events[j].get('value', '0')
                j += 1

            instruments_raw.append({
                'name':     name,
                'arm':      arm,
                'count':    int(count)    if count    else 1,
                'duration': float(duration) if duration else 0.0,
            })
            i = j
            continue
        i += 1

    # ── Deduplicate: merge same instrument name (sum durations, sum counts) ───
    merged = {}
    for inst in instruments_raw:
        key = inst['name']
        if key not in merged:
            merged[key] = {
                'name':     inst['name'],
                'arm':      inst['arm'],
                'count':    inst['count'],
                'duration': inst['duration'],
            }
        else:
            merged[key]['duration'] += inst['duration']
            merged[key]['count']    += inst['count']

    # ── Calculate percentage relative to total instrument time ───────────────
    total_duration = sum(v['duration'] for v in merged.values())

    instruments_out = []
    for inst in merged.values():
        pct = round((inst['duration'] / total_duration * 100)) if total_duration > 0 else 0
        instruments_out.append({
            'name':            inst['name'],
            'arm':             inst['arm'],
            'count':           inst['count'],
            'duration_sec':    round(inst['duration'], 2),
            'duration_min':    round(inst['duration'] / 60, 2),
            'duration_label':  _fmt_seconds(inst['duration']),
            'percentage':      pct,
        })

    # Sort by duration descending
    instruments_out.sort(key=lambda x: x['duration_sec'], reverse=True)
    result['instruments'] = instruments_out

    return result


def _fmt_seconds(sec: float) -> str:
    """Format seconds to mm:ss string."""
    sec  = int(sec)
    m, s = divmod(sec, 60)
    return f"{m}m {s}s"