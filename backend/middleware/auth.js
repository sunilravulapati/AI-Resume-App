import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

export const verifyToken = (...allowedRoles) => {

    return (req, res, next) => {

        try {

            // Read token from cookies
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized. Please login."
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request
            req.user = decoded;

            /*
            ROLE CHECK
            */

            if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(decoded.role)
            ) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }

            next();

        } catch (err) {

            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Session expired. Please login again."
                });
            }

            if (err.name === "JsonWebTokenError") {
                return res.status(401).json({
                    message: "Invalid token"
                });
            }

            console.error("Auth middleware error:", err);

            return res.status(500).json({
                message: "Authentication error"
            });

        }

    };

};