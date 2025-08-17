const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Burst rate limiting for specific endpoints
 */
const burstRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    success: false,
    error: 'Burst Rate Limit Exceeded',
    message: 'Too many requests in a short time, please slow down.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Burst Rate Limit Exceeded',
      message: 'Too many requests in a short time, please slow down.',
      timestamp: new Date(),
    });
  },
});

/**
 * Rate limiting for file uploads
 */
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: 'Upload Rate Limit Exceeded',
    message: 'Too many file uploads, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Upload Rate Limit Exceeded',
      message: 'Too many file uploads, please try again later.',
      timestamp: new Date(),
    });
  },
});

/**
 * Rate limiting for search endpoints
 */
const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 searches per 5 minutes
  message: {
    success: false,
    error: 'Search Rate Limit Exceeded',
    message: 'Too many search requests, please try again later.',
    timestamp: new Date(),
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Search Rate Limit Exceeded',
      message: 'Too many search requests, please try again later.',
      timestamp: new Date(),
    });
  },
});

module.exports = {
  rateLimitMiddleware,
  authRateLimit,
  burstRateLimit,
  uploadRateLimit,
  searchRateLimit,
};
