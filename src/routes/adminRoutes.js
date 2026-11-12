const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const questionController = require('../controllers/questionController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Protect admin routes with token
router.use(authenticateToken);
router.use(requireRole('ADMIN', 'RECRUITER', 'REVIEWER'));

router.get('/stats', adminController.getDashboardStats);
router.get('/candidates', adminController.listCandidates);
router.get('/sessions/:id/report', adminController.getSessionReport);
router.post('/invitations', adminController.createInvitation);

// Questions
router.get('/questions', questionController.listQuestions);
router.post('/questions/import', questionController.importQuestions);
router.patch('/questions/:id/status', questionController.updateQuestionStatus);

module.exports = router;

