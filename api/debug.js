const fs = require('fs');
const path = require('path');

function listFiles(dir, depth = 0) {
    if (depth > 2) return [];
    try {
        const files = fs.readdirSync(dir);
        let results = [];
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                results.push({ name: file, type: 'dir', children: listFiles(fullPath, depth + 1) });
            } else {
                results.push({ name: file, type: 'file', size: stats.size });
            }
        });
        return results;
    } catch (e) {
        return [`Error: ${e.message}`];
    }
}

module.exports = (req, res) => {
    const root = process.cwd();
    const tree = listFiles(root);
    res.status(200).json({
        cwd: root,
        tree: tree
    });
};
