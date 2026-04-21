const fs = require('fs');
const path = require('path');

const mainPath = path.join(process.cwd(), 'dist/api/main');

console.log('Unified API: Booting...');

module.exports = async (req, res) => {
    const { url } = req;
    console.log(`Unified API: Handling ${url}`);

    // Route: /api/info
    if (url === '/api/info') {
        return res.status(200).json({
            status: 'online',
            cwd: process.cwd(),
            dirname: __dirname,
            node: process.version,
            mainExists: fs.existsSync(mainPath + '.js')
        });
    }

    // Route: /api/debug
    if (url === '/api/debug') {
        try {
            const files = fs.readdirSync(process.cwd());
            const distExists = fs.existsSync(path.join(process.cwd(), 'dist'));
            const distApi = distExists ? fs.readdirSync(path.join(process.cwd(), 'dist/api')) : 'none';
            return res.status(200).json({ root: files, distApi });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // Default: NestJS Application
    try {
        console.log('Unified API: Requiring NestJS...');
        const main = require(mainPath);
        const handler = main.default || main.handler || main;
        
        if (typeof handler !== 'function') {
            throw new Error('Loaded main is not a function/handler');
        }

        console.log('Unified API: Executing handler...');
        return await handler(req, res);
    } catch (err) {
        console.error('Unified API Panic:', err);
        return res.status(500).json({
            error: 'NestJS Bootstrap Failed',
            message: err.message,
            stack: err.stack
        });
    }
};
