
require('dotenv').config();
const WHITELIST_DOMAINS = require('../utils/constants');
const StatusCodes = require('http-status-codes');


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }
    console.error(`${origin} not allowed by our CORS Policy.`);
    return callback(null, false);
  },
  optionsSuccessStatus: 200,

  credentials: true
}
module.exports = corsOptions;