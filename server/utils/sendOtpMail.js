const nodemailer = require("nodemailer");

const sendOtpMail = async (email, otp) => {
  // Debug log (Remove this after it works)
  console.log("Attempting to send OTP to:", email);
  console.log("Using User:", process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Placement Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "PlacementHub OTP Verification",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Verification Code</h2>
          <p>Your one-time password (OTP) for Placement Hub is:</p>
          <h1 style="letter-spacing: 5px; color: #1e293b;">${otp}</h1>
          <p style="font-size: 12px; color: #64748b;">Valid for 10 minutes. Please do not share this code.</p>
        </div>
      `
    });
    console.log("✅ OTP sent successfully");
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error; // Let the auth route catch this
  }
};

module.exports = sendOtpMail;