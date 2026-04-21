/**
 * Deep Diagnostic: Test Require Speed
 */
const start = Date.now();
console.log('Diagnostic Wrapper: Starting require...');

try {
    const path = require('path');
    const mainPath = path.join(process.cwd(), 'apps/api/dist/apps/api/src/main');

    const main = require(mainPath);
    const duration = Date.now() - start;
    console.log(`Diagnostic Wrapper: Module loaded in ${duration}ms`);

    module.exports = (req, res) => {
        res.status(200).json({
            status: 'ok',
            message: 'Diagnostic: Module loaded successfully',
            loadDurationMs: duration,
            mainPath: mainPath,
            cwd: process.cwd()
        });
    };
} catch (err) {
    const duration = Date.now() - start;
    console.error(`Diagnostic Wrapper: Failed to load in ${duration}ms`, err);
    module.exports = (req, res) => {
        res.status(500).json({
            status: 'error',
            message: 'Diagnostic: Failed to load module',
            loadDurationMs: duration,
            error: err.message,
            stack: err.stack
        });
    };
}
