// Import JSON Web Token
const jwt = require("jsonwebtoken");


// Authentication middleware
const protect = (req, res, next) => {

    try {

        // Get Authorization header
        const authHeader = req.headers.authorization;


        // Check if Authorization header exists
        // and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }


        // Extract JWT from:
        // Bearer <token>
        const token = authHeader.split(" ")[1];


        // Verify JWT using our secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Store decoded user information
        // so controllers can access it.
        req.user = decoded;


        // Continue to the protected route
        next();

    } catch (error) {

        // Token is invalid or expired
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


// Export middleware
module.exports = protect;