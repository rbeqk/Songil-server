const requestIp = require('request-ip');

// inside middleware handler
const ipMiddleware = function(req, res, next) {
    const clientIp = requestIp.getClientIp(req); 
    req.clientIp = clientIp;
    next();
};

module.exports = {
  ipMiddleware,
}