const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/admin/login', authController.adminLogin);
router.post('/candidate/start', authController.candidateStart);
router.post('/refresh', authController.refreshToken);

module.exports = router;

