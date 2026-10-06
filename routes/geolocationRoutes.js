const express = require('express');
const router = express.Router();
const {
  getNearbyServices,
  searchServices
} = require('../controllers/geolocationController');

// Public geolocation routes
router.get('/nearby', getNearbyServices);
router.get('/search', searchServices);

module.exports = router;
