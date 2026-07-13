import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("========== SMTP ENV ==========");
console.log("HOST:", process.env.EMAIL_HOST);
console.log("PORT:", process.env.EMAIL_PORT);
console.log("USER:", process.env.EMAIL_USER);
console.log("FROM:", process.env.EMAIL_FROM);
console.log("PASS EXISTS:", !!process.env.EMAIL_PASS);
console.log("==============================");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,          // STARTTLS on 587
  requireTLS: true,
  family: 4,              // Prefer IPv4

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendMail = async (email, otp) => {
  try {
    console.log("Sending verification mail to:", email);

    const info = await transporter.sendMail({
      from: `"Chatly" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify your Chatly account",
      html: `
        <div style="font-family: Arial,sans-serif">
          <h2>Chatly Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("Mail sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Verification mail error:");
    console.error(err);
    return false;
  }
};

export default sendMail;

export const sendPasswordResetMail = async (email, otp) => {
  try {
    console.log("Sending password reset mail to:", email);

    const info = await transporter.sendMail({
      from: `"Chatly" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Chatly Password Reset OTP",
      text: `Your Chatly password reset OTP is ${otp}. It expires in 5 minutes.`,
    });

    console.log("Password reset mail sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Password reset mail error:");
    console.error(err);
    return false;
  }
};