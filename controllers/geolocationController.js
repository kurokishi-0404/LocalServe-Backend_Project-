const Service = require('../models/Service');

/**
 * Calculate distance between two lat/lng coordinates in kilometers using Haversine formula
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * @desc    Find services near given latitude, longitude, and radius
 * @route   GET /api/geolocation/nearby
 * @access  Public
 * @example GET /api/geolocation/nearby?lat=19.24&lng=73.13&radius=10
 */
const getNearbyServices = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both lat and lng query parameters'
      });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radius);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(maxRadius)) {
      return res.status(400).json({
        success: false,
        message: 'lat, lng, and radius must be valid numbers'
      });
    }

    // Find all services with non-null coordinates
    const query = {
      latitude: { $ne: null },
      longitude: { $ne: null }
    };

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    const allServices = await Service.find(query).populate(
      'provider',
      'name email phone rating isVerified'
    );

    // Compute distance and filter within radius
    const nearbyServices = allServices
      .map((service) => {
        const distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          service.latitude,
          service.longitude
        );
        return {
          ...service.toObject(),
          distanceKm
        };
      })
      .filter((service) => service.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      center: { latitude: userLat, longitude: userLng },
      radiusKm: maxRadius,
      count: nearbyServices.length,
      data: nearbyServices
    });
  } catch (error) {
    console.error('Error fetching nearby services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching nearby services',
      error: error.message
    });
  }
};

/**
 * @desc    Search services by location text, category, or service title
 * @route   GET /api/geolocation/search
 * @access  Public
 * @example GET /api/geolocation/search?location=Mumbai&service=Plumbing&category=Repairs
 */
const searchServices = async (req, res) => {
  try {
    const { location, service, category } = req.query;
    const query = {};

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (service) {
      query.$or = [
        { title: { $regex: new RegExp(service, 'i') } },
        { description: { $regex: new RegExp(service, 'i') } }
      ];
    }

    const results = await Service.find(query)
      .populate('provider', 'name email phone rating isVerified')
      .sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error in location search:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during location search',
      error: error.message
    });
  }
};

module.exports = {
  getNearbyServices,
  searchServices
};
