const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ redirect: '/login.html', message: "No token provided" });
    }

    token = token.trim();

    // First, try to verify the token as-is
    jwt.verify(token, config.secret, (err, user) => {
        if (!err) {
            req.user = user;
            return next();
        }

        // If verification failed, check if it's due to malformation
        if (err.name === "JsonWebTokenError" && err.message === "jwt malformed") {
            console.error("Received malformed token:", token);
            
            // Attempt to parse the token manually
            try {
                const decodedToken = jwt.decode(token, { complete: true });
                
                if (decodedToken && decodedToken.payload) {
                    // If we can decode the payload, try to verify it again
                    jwt.verify(decodedToken.payload, config.secret, (verifyErr, verifiedUser) => {
                        if (verifyErr) {
                            console.error("Failed to verify decoded token:", verifyErr.message);
                            return res.status(403).json({ redirect: '/login.html', message: "Invalid token" });
                        }
                        req.user = verifiedUser;
                        return next();
                    });
                } else {
                    console.error("Failed to decode token payload");
                    return res.status(403).json({ redirect: '/login.html', message: "Invalid token format" });
                }
            } catch (decodeErr) {
                console.error("Error decoding token:", decodeErr.message);
                return res.status(403).json({ redirect: '/login.html', message: "Invalid token format" });
            }
        } else {
            // For other verification errors
            console.error("Token verification error:", err.message);
            return res.status(403).json({ redirect: '/login.html', message: "Failed to authenticate token" });
        }
    });
}

module.exports = authenticateToken;
