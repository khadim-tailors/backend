module.exports.sendResponse = ({ res, status, message, result }) => {
    return res.json({ message, result, code: 200, status });
};
