const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privateKeyPath = path.join(__dirname, "..", "keys", "jwtRS256.key");
const publicKeyPath = path.join(__dirname, "..", "keys", "jwtRS256.key.pub");

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

module.exports = {
  signToken: function (payload, expiresIn = "30d") {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: expiresIn,
    });
  },
  verifyToken: function (token) {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
  },
};
