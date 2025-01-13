const { verifyToken } = require("../utils/Token");

async function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  try {
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "unauthorized access" });
    const result = await verifyToken(token);
    if (!result.success)
      return res
        .status(401)
        .json({ success: result.success, message: result.message });  
    req.userId = result.data;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "unauthorized access" });
  }
}
module.exports = authenticateToken;
