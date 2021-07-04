const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized");
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    if (!payload) {
      return res.status(401).send("Unauthorized");
    }
    console.log(payload);
    req.userID = payload.userId;
    next();
  } catch {
    return res.status(401).send("Unauthorized");
  }
};
module.exports = verifyToken;
