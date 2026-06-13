import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

const { verify } = jwt

export const verifyToken = (...allowedRoles) => {
    return (req, res, next) => {
        // access the token from cookie
        const token = req.cookies?.token

        // if token doesn't exist
        if (!token) {
            return res.status(401).json({ message: "Please Login." })
        }

        try {
            // verify and decode token
            const decodedToken = verify(token, process.env.JWT_SECRET)

            // check if role matches
            if (!allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: "You are not authorized." })
            }

            // attach user to request
            req.user = decodedToken
            next()

        } catch (err) {
            return res.status(401).json({ message: "Session Expired, Please Re-login." })
        }
    }
}