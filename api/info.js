module.exports = (req, res) => {
    res.status(200).json({
        cwd: process.cwd(),
        dirname: __dirname,
        env: process.env.NODE_ENV,
        version: process.version
    });
};
