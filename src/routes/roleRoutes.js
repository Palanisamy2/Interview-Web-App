const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/', roleController.listRoles);
router.get('/:id/stacks', roleController.listStacksForRole);

module.exports = router;

