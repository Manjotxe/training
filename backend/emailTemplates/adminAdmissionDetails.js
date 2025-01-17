const adminAdmissionDetailsTemplate = (admissionData, cleanedSignature, cleanedPhoto) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <img src="https://via.placeholder.com/600x150" alt="Header Image" style="width: 100%; max-height: 150px;" />
    <h3>New Admission Form Submission</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><th style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;">Name</th><td style="padding: 12px; border: 1px solid #ddd;">${admissionData.name}</td></tr>
      <!-- Repeat for all fields -->
      <tr>
        <th style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;">Signature</th>
        <td style="padding: 12px; border: 1px solid #ddd;">
          ${cleanedSignature ? `<img src="data:image/png;base64,${cleanedSignature}" alt="Signature" style="max-width: 100px; height: auto;" />` : 'No signature provided'}
        </td>
      </tr>
      <tr>
        <th style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;">Photo</th>
        <td style="padding: 12px; border: 1px solid #ddd;">
          ${cleanedPhoto ? `<img src="data:image/jpeg;base64,${cleanedPhoto}" alt="Photo" style="max-width: 100px; height: auto;" />` : 'No photo provided'}
        </td>
      </tr>
    </table>
    <p><strong>Password:</strong> ${admissionData.password}</p>
    <p>Best regards,<br />The Admission Team</p>
  </div>
`;

module.exports = adminAdmissionDetailsTemplate;
