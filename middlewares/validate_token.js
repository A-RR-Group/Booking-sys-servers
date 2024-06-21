const jwt = require('jsonwebtoken');

const validate_token = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && (authHeader.startsWith("Bearer") || authHeader.startsWith("bearer"))) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken)

        if (!refreshToken) return res.status(401).json({ error: "Unauthorized user" });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) return res.status(403).json({ error: "Forbidden" });

          const newAccessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

          // Send the new access token to the client
          req.accessToken = newAccessToken ;
          next();
        });
      } else {
        // Token is valid
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ error: "Token missing" });
  }
};

module.exports = validate_token;
