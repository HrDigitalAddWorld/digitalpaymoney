const jwt = require('jsonwebtoken');
const JWT_SECRET = "yourSecretKey"; // Same secret key as above

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded; // user._id, user.email available
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
