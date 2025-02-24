const userConfirmationTemplate = (name, email, courseName, password) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <img src="https://via.placeholder.com/600x150" alt="Header Image" style="width: 100%; max-height: 150px;" />
    <h2>Dear ${name},</h2>
    <p>Your admission to the course <strong>${courseName}</strong> has been successfully processed.</p>
    <p>Here are your login details:</p>
    <ul>
      <li>Email: <strong>${email}</strong></li>
      <li>Password: <strong>${password}</strong></li>
    </ul>
    <p>We look forward to seeing you excel in your studies!</p>
    <br />
    <p>Best regards,<br />The Admission Team</p>
  </div>
`;

module.exports = userConfirmationTemplate;
