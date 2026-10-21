export function parseDiff(patch) {
    let old = 0, next = 0, inHunk = false, added = 0, deleted = 0, hunks = 0;
    const raw = patch.split('\n');
    if (raw.at(-1) === '')
        raw.pop();
    const lines = raw.map((text, id) => {
        if (text.startsWith('diff --git '))
            inHunk = false;
        const match = text.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
            old = Number(match[1]);
            next = Number(match[2]);
            inHunk = true;
            hunks++;
            return { id, text, kind: 'hunk', old: null, next: null };
        }
        if (inHunk && text.startsWith('+')) {
            added++;
            return { id, text, kind: 'add', old: null, next: next++ };
        }
        if (inHunk && text.startsWith('-')) {
            deleted++;
            return { id, text, kind: 'del', old: old++, next: null };
        }
        if (inHunk && text.startsWith(' '))
            return { id, text, kind: 'context', old: old++, next: next++ };
        return { id, text, kind: 'meta', old: null, next: null };
    });
    return { lines, added, deleted, hunks };
}
export function splitDiff(lines) {
    const rows = [];
    for (let i = 0; i < lines.length;) {
        const line = lines[i];
        if (line.kind === 'meta' || line.kind === 'hunk') {
            rows.push({ id: line.id, header: line });
            i++;
            continue;
        }
        if (line.kind === 'context') {
            rows.push({ id: line.id, left: line, right: line });
            i++;
            continue;
        }
        const deleted = [], added = [];
        while (i < lines.length && lines[i].kind === 'del')
            deleted.push(lines[i++]);
        while (i < lines.length && lines[i].kind === 'add')
            added.push(lines[i++]);
        for (let j = 0; j < Math.max(deleted.length, added.length); j++)
            rows.push({ id: (deleted[j] ?? added[j]).id, left: deleted[j], right: added[j] });
    }
    return rows;
}
