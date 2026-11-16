const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ message: 'Not authorized, invalid token format' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medy_hospital_admin_secret_key_2026');

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      if (req.admin.status === 'Inactive') {
        return res.status(403).json({ message: 'Account has been deactivated. Please contact the Super Administrator.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };

