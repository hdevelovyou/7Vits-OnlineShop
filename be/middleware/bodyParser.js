const express = require('express');

// Middleware để phân tích JSON
const bodyParserMiddleware = express.json();

// Middleware để phân tích URL-encoded
const urlEncodedMiddleware = express.urlencoded({ extended: true });

module.exports = { bodyParserMiddleware, urlEncodedMiddleware };
