const adminAdmissionDetailsTemplate = (admissionData) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center;">
    
    <!-- Photo -->
    ${
      admissionData.photo
        ? `<div style="margin-top: 20px;">
             <img src="cid:photo" alt="Photo" style="max-width: 250px; height: auto; border-radius: 10px;" />
           </div>`
        : "<p>No photo provided</p>"
    }

    <h3 style="margin-top: 30px;">New Admission Form Submission</h3>

    <!-- Admission Data -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      ${Object.entries(admissionData)
        .filter(([key]) => !["signature", "photo", "password"].includes(key))
        .map(
          ([key, value]) => `
        <tr>
          <th style="padding: 12px; border: 1px solid #ddd; background-color: #f5f5f5;">${key}</th>
          <td style="padding: 12px; border: 1px solid #ddd;">${
            value || "Not Provided"
          }</td>
        </tr>`
        )
        .join("")}
    </table>

    <!-- Signature -->
    ${
      admissionData.signature
        ? `<div style="margin-top: 20px;">
             <h4>Signature</h4>
             <img src="cid:signature" alt="Signature" style="max-width: 250px; height: auto;" />
           </div>`
        : "<p>No signature provided</p>"
    }

    <p style="margin-top: 30px;">Best regards,<br />The Admission Team</p>
  </div>
`;

module.exports = adminAdmissionDetailsTemplate;
