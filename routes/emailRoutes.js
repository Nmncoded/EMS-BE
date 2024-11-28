const express = require("express");
const router = express.Router();
const { testServer, scheduleEmail, getScheduledJobs } = require("../controllers/emailController");

// Test server route
router.get("/test-server", testServer );

// Email scheduling route
router.post('/schedule-email', scheduleEmail );

// Get scheduled jobs route
router.get('/scheduled-jobs', getScheduledJobs );

module.exports = router;