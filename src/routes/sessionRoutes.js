const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.post('/:id/start', sessionController.startSession);
router.get('/:id/questions', sessionController.getSessionQuestions);
router.put('/:id/answers/:questionId', sessionController.autosaveAnswer);
router.post('/:id/run-code', sessionController.runCode);
router.post('/:id/telemetry/:questionId', sessionController.recordTelemetry);
router.post('/:id/events', sessionController.logAuditEvent);
router.post('/:id/submit', sessionController.submitSession);
router.get('/:id/status', sessionController.getSessionStatus);

module.exports = router;

