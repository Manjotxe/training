// birthdayService.js

const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const db = require('./connection');

// Email template for birthday wishes
const createBirthdayEmailTemplate = (name) => {
  return {
    subject: '🎉 Happy Birthday from Our Institution!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Happy Birthday, ${name}! 🎂</h2>
        <p>We hope your day is filled with joy and celebration!</p>
        <p>On behalf of our entire institution, we wish you a wonderful birthday and a great year ahead.</p>
        <br>
        <p>Best wishes,</p>
        <p>Your Institution Name</p>
      </div>
    `
  };
};

// Function to send birthday email
const sendBirthdayEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASS,
    }
  });

  const emailTemplate = createBirthdayEmailTemplate(user.name);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });
    console.log(`Birthday email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending birthday email to ${user.email}:`, error);
  }
};

// Function to check for birthdays
const checkBirthdays = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // JavaScript months are 0-based
  const day = today.getDate();

  // Query to find users whose birthday is today
  const query = `
    SELECT name, email, dob 
    FROM admission_form 
    WHERE MONTH(dob) = ? AND DAY(dob) = ?
  `;

  db.query(query, [month, day], (err, results) => {
    if (err) {
      console.error('Error checking birthdays:', err);
      return;
    }

    // Send emails to all users with birthdays today
    results.forEach(user => {
      sendBirthdayEmail(user);
    });
  });
};

// Schedule birthday check to run every day at 9:00 AM
const scheduleBirthdayEmails = () => {
  schedule.scheduleJob('0 9 * * *', () => {
    console.log('Running scheduled birthday check...');
    checkBirthdays();
  });
};


module.exports = {
  scheduleBirthdayEmails,
  checkBirthdays // Export for testing purposes
};