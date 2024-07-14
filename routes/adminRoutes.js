// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes
router.get('/travelers', adminController.getAllTravelers);
router.get('/travelers/:userId/wallet', adminController.getWalletBalance);
router.post('/travelers/:userId/wallet/update', adminController.updateWalletBalance);
router.post('/register', adminController.registerTraveler);
router.post('/login', adminController.login); // New route for admin login
router.post('/:userId/assign-card', adminController.assignRFIDCard);
router.delete('/:userId/delete', adminController.deleteTraveler);

module.exports = router;
