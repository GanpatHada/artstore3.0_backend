const { verifyToken } = require("../utils/Token");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Token not provided" });
  try {
    const userId = verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "unauthorized access" });
  }
}
module.exports=authenticateToken;
