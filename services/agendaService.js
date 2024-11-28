const Agenda = require("agenda");
const createTransporter = require("../config/nodemailer");

class AgendaService {
  constructor() {
    this.agenda = null;
    this.transporter = createTransporter();
  }

  async initialize() {
    try {
      this.agenda = new Agenda({
        db: { 
          address: process.env.MONGODB_URI,
          collection: 'emailJobs'
        }
      });

      this.agenda.define('send email', async (job) => {
        const { to, subject, body } = job.attrs.data;

        try {
          await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: body,
          });
          console.log(`Email sent to ${to}`);
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });

      await this.agenda.start();
      console.log('Agenda initialized and started successfully');
    } catch (error) {
      console.error('Failed to initialize Agenda:', error);
    }
  }

  async scheduleEmail(email, subject, body, scheduledTime) {
    if (!this.agenda) {
      throw new Error('Agenda not initialized');
    }

    return await this.agenda.schedule(new Date(scheduledTime), 'send email', {
      to: email,
      subject: subject,
      body: body
    });
  }

  async getScheduledJobs() {
    if (!this.agenda) {
      throw new Error('Agenda not initialized');
    }

    const jobs = await this.agenda.jobs({
      'data.to': { $exists: true }
    });

    return jobs.map(job => ({
      id: job.attrs._id.toString(),
      email: job.attrs.data.to,
      subject: job.attrs.data.subject,
      scheduledAt: job.attrs.nextRunAt
    }));
  }

  async stop() {
    if (this.agenda) {
      await this.agenda.stop();
    }
  }
}

module.exports = new AgendaService();