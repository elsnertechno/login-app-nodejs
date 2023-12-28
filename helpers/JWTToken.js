const jwt = require('jsonwebtoken');
const { errorResponse } = require('./response');

class JWTAuthenticator {
    // Method to verify a JWT token
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            // Using Response class for a detailed error response
            return errorResponse(res, 401, 'Unauthorized: No token provided');
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                // Using Response class for consistent error handling
                return errorResponse(res, 403, 'Forbidden: Invalid token');
            }
            req.user = user;
            next();
        });
    }
    // Method to create a new JWT token
    createJWTToken(payload, expiresIn = '1y') {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
    }
}

module.exports = new JWTAuthenticator();
