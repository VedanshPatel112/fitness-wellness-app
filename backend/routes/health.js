const express = require('express');
const router = express.Router();
const { submitHealth, getHistory, generatePlan } = require('../controllers/healthController');

router.post('/submit', submitHealth);
router.get('/history/:userId', getHistory);
router.post('/plan/:userId', generatePlan);
module.exports = router;