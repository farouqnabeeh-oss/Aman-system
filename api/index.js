/**
 * Vercel Serverless Function Wrapper for NestJS API
 */
console.log('API Wrapper: Initializing...');
console.log('API Wrapper: __dirname:', __dirname);
console.log('API Wrapper: cwd:', process.cwd());

try {
    const mainPath = require('path').join(__dirname, 'apps/api/dist/apps/api/src/main');
    console.log('API Wrapper: Attempting to require main from:', mainPath);
    const main = require(mainPath);
    console.log('API Wrapper: Main module loaded successfully');

    const handler = main.default || main;

    module.exports = async (req, res) => {
        try {
            return await handler(req, res);
        } catch (err) {
            console.error('API Wrapper: Runtime Error:', err);
            res.status(500).json({
                statusCode: 500,
                message: 'Internal Server Error (Wrapper Catch)',
                error: err.message
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
