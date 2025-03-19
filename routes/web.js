const express = require('express');
const {getHomePage, getColorGalaxy} = require('../controllers/HomeController');
const router = express.Router();

router.get('/', getHomePage);
router.get('/ColorGalaxy', getColorGalaxy);

module.exports = router;