const nodemailer = require("nodemailer");
const userConfirmationTemplate = require("./emailTemplates/userConfirmation");
const adminAdmissionDetailsTemplate = require("./emailTemplates/adminAdmissionDetails");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAdmissionConfirmationEmail = (name, email, courseName, password) => {
  const htmlContent = userConfirmationTemplate(name, email, courseName, password);

  const mailOptionsForUser = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Admission Confirmation",
    html: htmlContent,
  };

  return transporter.sendMail(mailOptionsForUser);
};

const sendAdmissionDetailsToAdmin = (admissionData) => {
  const cleanedSignature = admissionData.signature || "";
  const cleanedPhoto = admissionData.photo || "";
  const htmlContent = adminAdmissionDetailsTemplate(admissionData, cleanedSignature, cleanedPhoto);

  const mailOptionsForAdmin = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "New Admission Form Submitted",
    html: htmlContent,
  };

  return transporter.sendMail(mailOptionsForAdmin);
};

module.exports = {
  sendAdmissionConfirmationEmail,
  sendAdmissionDetailsToAdmin,
};
