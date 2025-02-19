const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendTaskInvitation(recipientEmail, taskDetails, inviterName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `You've been invited to collaborate on a task: ${taskDetails.title}`,
      html: `
        <h2>Task Invitation</h2>
        <p>Hello,</p>
        <p>${inviterName} has invited you to collaborate on a task in TaskFlow.</p>
        <h3>Task Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${taskDetails.title}</li>
          <li><strong>Description:</strong> ${taskDetails.description}</li>
          <li><strong>Priority:</strong> ${taskDetails.priority}</li>
        </ul>
        <p>Click <a href="${process.env.FRONTEND_URL}/tasks/${taskDetails.id}">here</a> to view the task.</p>
        <p>Best regards,<br>TaskFlow Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendProjectInvitation(recipientEmail, projectDetails, inviterName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `You've been invited to collaborate on a project: ${projectDetails.title}`,
      html: `
        <h2>Project Invitation</h2>
        <p>Hello,</p>
        <p>${inviterName} has invited you to collaborate on a project in TaskFlow.</p>
        <h3>Project Details:</h3>
        <ul>
          <li><strong>Title:</strong> ${projectDetails.title}</li>
          <li><strong>Description:</strong> ${projectDetails.description}</li>
        </ul>
        <p>Click <a href="${process.env.FRONTEND_URL}/projects/${projectDetails.id}">here</a> to view the project.</p>
        <p>Best regards,<br>TaskFlow Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

module.exports = new EmailService(); 