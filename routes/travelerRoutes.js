// routes/travelerRoutes.js

const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');

// Traveler routes
router.get('/wallet', travelerController.getWalletBalance);
router.post('/wallet/update', travelerController.updateWalletBalance);
router.post('/login', travelerController.login);
router.get('/bus-timings', travelerController.getBusTimings);
router.get('/:userId/wallet/balance', travelerController.checkWalletBalance);
router.post('/:userId/wallet/top-up', travelerController.topUpBalance);

module.exports = router;
