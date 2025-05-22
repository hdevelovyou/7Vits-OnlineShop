const jwt = require('jsonwebtoken');    
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) {
    return res.sendStatus(401).json({ error:'Token is not exists'}); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) {
      return res.sendStatus(403).json({ error:'Token is not valid'}); // Forbidden
    }
    req.user = user;
    next();
  }
    );
}
module.exports = authenticateToken;