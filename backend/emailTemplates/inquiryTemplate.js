const inquiryTemplate = (name) => ` 
  <div style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center;">
    <h2>Hello ${name},</h2>
    <p>Thank you for reaching out to us! We have received your inquiry.</p>

    <h3>Your Canvas Drawing:</h3>
    <img src="cid:canvasImage" alt="Canvas Image" style="max-width: 400px; border-radius: 10px; margin-top: 10px;"/>

    <p>If you have any further questions, feel free to reply to this email.</p>
    
    <p style="margin-top: 30px;">Best regards,<br/>Yorex Infotech Team</p>
  </div>
`;

module.exports = inquiryTemplate;
