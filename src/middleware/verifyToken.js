import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken =  (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const SECRET_KEY = process.env.SECRET_KEY;
    const user =  JWT.verify(token, SECRET_KEY);

    if (!user) res.status(404).send("Invalid authorization token");

    req.user_id = user?.user_Id;
    req.role = user?.user_role;

    next();
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
};
