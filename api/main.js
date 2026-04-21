/**
 * Aman API: Production Serverless Wrapper
 * Optimized for Vercel with path resolution and deferred initialization.
 */
const path = require('path');
const mainPath = path.join(process.cwd(), 'apps/api/dist/apps/api/src/main');

console.log('API Wrapper: Entry starting...');

module.exports = async (req, res) => {
    try {
        console.log(`API Wrapper: Hit ${req.url}. Attempting to require main...`);
        const main = require(mainPath);
        const handler = main.default || main.handler || main;

        if (typeof handler !== 'function') {
            console.error('API Wrapper: Loaded main is not a function/handler', typeof handler);
            return res.status(500).send('API Internal Configuration Error: Main is not a function');
        }

        console.log('API Wrapper: Handoff to NestJS handler...');
        
        // Safeguard timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request Timeout (15s Safeguard)')), 15000)
        );

        return await Promise.race([handler(req, res), timeout]);
    } catch (err) {
        console.error('API Wrapper Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
