console.log('DEBUG: Minimal API Worker Start');

module.exports = (req, res) => {
    console.log('DEBUG: Request inside lambda:', req.url);
    res.status(200).json({
        message: 'Aman API: Minimal Test Success',
        env_check: {
            node_env: process.env.NODE_ENV,
            db_present: !!process.env.DATABASE_URL
        }
    });
};
