// utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define the log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',  // Set the default logging level (can be 'info', 'warn', 'error', etc.)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),

    // Daily rotate file transport for error logs
    new DailyRotateFile({
      filename: 'logs/%DATE%-error.log', // Store logs in a 'logs' folder with daily rotation
      datePattern: 'YYYY-MM-DD',  // Logs will be rotated daily
      maxSize: '20m',  // Maximum size of each log file (20MB)
      maxFiles: '14d',  // Keep logs for the last 14 days
      level: 'error',  // Only log errors in the rotated file
      format: winston.format.combine(
        winston.format.timestamp(),
        logFormat
      ),
    }),

    // Daily rotate file transport for general logs
    new DailyRotateFile({
      filename: 'logs/%DATE%-general.log', // Store general logs in a separate file
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m', // Maximum size for each log file
      maxFiles: '30d', // Keep logs for 30 days
      level: 'info', // General logs (info level)
      format: winston.format.combine(
        winston.format.timestamp(),
        logFormat
      ),
    }),
  ],
});

// Export the logger to use it in other parts of the project
module.exports = logger;
