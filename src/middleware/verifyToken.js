import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing", success: false });
    }

    // Load the secret key from environment variables
    const SECRET_KEY = process.env.SECRET_KEY;

    // Verify the token
    const user = JWT.verify(token, SECRET_KEY);

    // Check if the token payload has the required user information
    if (!user || !user.user_Id) {
      return res.status(401).json({ message: "Token expired or invalid", success: false });
    }

    // Attach user information to the request object
    req.user_id = user.user_Id;
    req.role = user.user_role;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors
    console.log(error.name);
    if (error.name === "TokenExpiredError") {
      return res.status(200).json({ message: "Token has expired", success: false });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(200).json({ message: "Invalid token", success: false });
    } else {
      // Handle any other errors
      return res.status(200).json({ message: "An error occurred: " + error.message, success: false });
    }
  }
};
