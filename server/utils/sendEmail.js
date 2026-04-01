// for-lawyers/server/utils/sendEmail.js
const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  if(!process.env.EMAIL_PASS){
    console.warn("EMAIL_PASS is not set in environment variables. Email sending will fail.");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #2563EB;">Legality App</h2>
        <p style="color: #666; font-size: 14px;">Secure Legal Practice Management</p>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Your Verification Code is:</p>

        <!-- options.otp dynamic value hai jo controller se aati hai -->
        <h1 style="color: #2563EB; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${options.otp}</h1>

        <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
      </div>

      <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Legality Security" <${process.env.EMAIL_USER}>`,

    to: options.email,
    subject: options.subject,
    html: htmlMessage,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
