import { verifyToken } from "../lib/jwt.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "You have to login" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "You have to login" });
  }

  req.user = decoded.user;
  next();
};


export const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};
