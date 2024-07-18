const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const AdminauthMiddleware = require('../middleware/authMiddleware');

// Admin routes
router.post('/login', adminController.login);
router.use(AdminauthMiddleware);
router.get('/travelers', adminController.getAllTravelers);
router.post('/register', adminController.registerTraveler);
router.post('/:userId/assign-card', adminController.assignRFIDCard);
router.delete('/:userId/delete', adminController.deleteTraveler);
router.put('/traveler/:userId/recharge', adminController.rechargeTravelerBalance);
router.get('/traveler/:userId/balance', adminController.getTravelerBalance);

module.exports = router;
