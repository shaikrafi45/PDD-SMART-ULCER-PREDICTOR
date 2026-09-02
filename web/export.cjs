const fs = require('fs');
const { execSync } = require('child_process');

try {
    const cmd = 'C:\\xampp\\mysql\\bin\\mysql.exe -u root -e "USE smart_ulcer_db; SELECT id, user_id, result, confidence, image_path, created_at FROM history ORDER BY id DESC;" --batch';
    const output = execSync(cmd, { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const items = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length >= 6) {
            items.push({
                id: parseInt(cols[0].trim(), 10),
                user_id: parseInt(cols[1].trim(), 10),
                result: cols[2].trim(),
                confidence: parseFloat(cols[3].trim()) || 0,
                image_path: cols[4].trim(),
                created_at: cols[5].trim()
            });
        }
    }
    fs.writeFileSync('web/src/utils/all_history.json', JSON.stringify(items, null, 2));
    console.log('SUCCESS: Exported ' + items.length + ' history items');
} catch (e) {
    console.error('Error exporting history:', e);
}
