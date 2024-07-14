const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const AdminauthMiddleware = require('../middleware/authMiddleware');

// Admin routes
router.post('/login', adminController.login);
router.use(AdminauthMiddleware);
router.get('/travelers', adminController.getAllTravelers);
router.get('/travelers/:userId/wallet', adminController.getWalletBalance);
router.post('/travelers/:userId/wallet/update', adminController.updateWalletBalance);
router.post('/register', adminController.registerTraveler);
router.post('/:userId/assign-card', adminController.assignRFIDCard);
router.delete('/:userId/delete', adminController.deleteTraveler);
router.get('/admin/traveler/:travelerId/wallet', adminController.getTravelerWalletBalance);
router.post('/admin/traveler/:travelerId/wallet/top-up', adminController.addTravelerWalletAmount);

module.exports = router;
