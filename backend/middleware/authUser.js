import jwt from "jsonwebtoken";

// user Authentication middleware

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    } 
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = tokenData.id;
    next();
  } catch (error) {
    // Don't log JWT errors to console - they're expected when tokens are invalid/expired
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.json({ success: false, message: "Invalid or expired token. Please login again." });
    }
    console.error('Auth User Error:', error);
    res.json({ success: false, message: "Authentication failed" });
  }
};

export default authUser;
