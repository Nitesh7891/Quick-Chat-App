import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided in auth middleware");
      return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("User not found in auth middleware");
      return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Error in auth middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid/Expired token", success: false });
  }
};
