const AgendaService = require("../services/agendaService");


const testServer = (req, res) => {
  res.status(200).json({
    message: "server tested successfully",
  });
}

const scheduleEmail = async (req, res) => {
  try {
    const {
      email,
      subject,
      body,
      scheduledTime = Date.now() + 2 * 60 * 1000 // Default to 2 minutes from now
    } = req.body;

    // Validate input
    if (!email || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          email: !!email,
          subject: !!subject,
          body: !!body
        }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Schedule email
    const job = await AgendaService.scheduleEmail(email, subject, body, scheduledTime);
    console.log(`Email scheduled for ${scheduledTime}`, job);

    res.status(200).json({
      message: 'Email scheduled successfully',
      jobId: job.attrs._id.toString(),
      scheduledFor: new Date(scheduledTime)
    });

  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({
      error: 'Failed to schedule email',
      details: error.message
    });
  }
}

const getScheduledJobs = async (req, res) => {
  try {
    const jobs = await AgendaService.getScheduledJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error retrieving scheduled jobs:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve scheduled jobs',
      details: error.message
    });
  }
}

module.exports = {
  testServer,
  scheduleEmail,
  getScheduledJobs,
}