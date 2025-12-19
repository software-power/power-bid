const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'payrollApi';

/**
 * Verify JWT access token and attach user info to request
 */
const AccessTokenVerifier = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader; // Token without "Bearer " prefix

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const errorMessage = err.message.replace('jwt', 'Token');
      return res.status(403).json({
        status: 'error',
        message: errorMessage,
      });
    }

    // Attach user info from JWT payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      role_id: decoded.role_id,
      main_account_id: decoded.main_account_id,
    };

    next();
  });
};

/**
 * Middleware to require OWNER role
 */
const requireOwnerRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  if (req.user.role_id !== 'OWNER') {
    return res.status(403).json({
      status: 'error',
      message: 'Only OWNER can perform this action',
    });
  }

  next();
};

/**
 * Middleware to require Admin type
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  if (req.user.type !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin rights required.',
    });
  }

  next();
};

/**
 * Method for refreshing token once old one expired
 * @param {String} token - Old token, required for new token refreshing
 */
const AccessTokenRefresher = (token) => {
  const decodedToken = jwt.decode(token);
  // TODO: implement refresh logic
  return decodedToken;
};

module.exports = {
  AccessTokenVerifier,
  requireOwnerRole,
  requireAdmin,
  AccessTokenRefresher,
};
