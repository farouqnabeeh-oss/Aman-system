/**
 * Vercel Serverless Function Wrapper for NestJS API
 */
console.log('API Wrapper: Initializing...');
console.log('API Wrapper: __dirname:', __dirname);
console.log('API Wrapper: cwd:', process.cwd());

try {
    const path = require('path');
    const mainPath = path.join(process.cwd(), 'apps/api/dist/apps/api/src/main');
    console.log('API Wrapper: Attempting to require main from:', mainPath);
    // Add log for env variable presence (safe)
    console.log('API Wrapper: DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.log('API Wrapper: DATABASE_URL prefix:', process.env.DATABASE_URL?.split(':')[0]);

    const main = require(mainPath);
    console.log('API Wrapper: Main module loaded successfully');

    const handler = main.default || main;

    module.exports = async (req, res) => {
        console.log(`API Wrapper: Request received: ${req.method} ${req.url}`);
        
        // Timeout safeguard for the request handler
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request Timeout (10s Safeguard)')), 10000)
        );

        try {
            return await Promise.race([handler(req, res), timeoutPromise]);
        } catch (err) {
            console.error('API Wrapper: Runtime Error:', err);
            res.status(500).json({
                statusCode: 500,
                message: 'Internal Server Error (Wrapper Catch)',
                error: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    };
} catch (err) {
    console.error('API Wrapper: Bootstrap Error:', err);
    module.exports = (req, res) => {
        res.status(500).json({
            statusCode: 500,
            message: 'Failed to bootstrap API',
            error: err.message,
            stack: err.stack
        });
    };
}
