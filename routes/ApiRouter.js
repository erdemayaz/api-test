const express = require('express');
const ApiController = require('../controllers/ApiController');

const router = express.Router();
const apiController = new ApiController();

/**
 * router uses controller. 
 * You can add some middlewares in this step
 */
router.post("/counts", apiController.postCounts); // It handles count api requests

module.exports = router;