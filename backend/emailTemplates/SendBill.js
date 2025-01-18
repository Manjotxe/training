const nodemailer = require('nodemailer');
const db = require("../connection"); // Import the database connection

// Nodemailer setup for sending email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// Function to send email with bill details
const sendBillEmail = (email, rupees, date) => {
  return new Promise((resolve, reject) => {
    // Query to fetch data from the `admission_form` table based on email
    const query = 'SELECT * FROM admission_form WHERE email = ?';

    db.query(query, [email], (err, results) => {
      if (err) {
        return reject('Error fetching data from database: ' + err.message);
      }

      if (results.length === 0) {
        return reject('No record found for this email');
      }

      const { name, courseName, admissionDate } = results[0];

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Your Receipt from YOREX INFOTECH',
        html: `
          <h1 style="color: pink; text-align: center;">YOREX INFOTECH</h1>
          <p style="text-align: center;">PROFESSIONAL TRAINING & DEVELOPMENT</p>
          <p style="text-align: center;">An ISO 9001:2008 Certified</p>
          <h2 style="text-align: center;">Receipt</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Field</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Details</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Admission Date</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(admissionDate)||null}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Name</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Course</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${courseName}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Amount (Rupees)</td>
              <td style="border: 1px solid #ddd; padding: 8px;">₹${rupees}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Email</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${email}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Bill Date</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${date}</td>
            </tr>
          </table>
          <p style="text-align: center;">Thank you for choosing YOREX INFOTECH!</p>
          <footer style="text-align: center; color: pink;">YOREX INFOTECH</footer>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return reject('Error sending email: ' + err.message);
        }
        console.log('Email sent:', info.response);
        resolve(info);
      });
    });
  });
};

module.exports = { sendBillEmail };
