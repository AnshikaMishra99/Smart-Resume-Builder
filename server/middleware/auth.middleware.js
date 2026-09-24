import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret_smart_resume_builder_key_2026"
      );

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};
