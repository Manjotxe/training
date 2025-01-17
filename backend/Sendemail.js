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
  const htmlContent = userConfirmationTemplate(
    name,
    email,
    courseName,
    password
  );

  const mailOptionsForUser = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Admission Confirmation",
    html: htmlContent,
  };

  return transporter.sendMail(mailOptionsForUser);
};

const sendAdmissionDetailsToAdmin = (admissionData) => {
  // Extract base64 content for attachments
  const signatureData = admissionData.signature
    ? admissionData.signature.split(",")[1]
    : null;
  const photoData = admissionData.photo
    ? admissionData.photo.split(",")[1]
    : null;

  const htmlContent = adminAdmissionDetailsTemplate(admissionData);

  const mailOptionsForAdmin = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "New Admission Form Submitted",
    html: htmlContent,
    attachments: [
      ...(signatureData
        ? [
            {
              filename: "signature.png",
              content: Buffer.from(signatureData, "base64"),
              cid: "signature", // Content-ID for inline image reference
            },
          ]
        : []),
      ...(photoData
        ? [
            {
              filename: "photo.jpg",
              content: Buffer.from(photoData, "base64"),
              cid: "photo", // Content-ID for inline image reference
            },
          ]
        : []),
    ],
  };

  return transporter.sendMail(mailOptionsForAdmin);
};

module.exports = {
  sendAdmissionConfirmationEmail,
  sendAdmissionDetailsToAdmin,
};
