import nodemailer from "nodemailer";

const sendMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Chatly" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Chatly account",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Chatly Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.log("Mail sending error:", error);
    return false;
  }
};

export default sendMail;