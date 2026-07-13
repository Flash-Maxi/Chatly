import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";


console.log("========== SMTP ENV ==========");
console.log("HOST:", process.env.EMAIL_HOST);
console.log("PORT:", process.env.EMAIL_PORT);
console.log("USER:", process.env.EMAIL_USER);
console.log("PASS EXISTS:", !!process.env.EMAIL_PASS);
console.log("==============================");

console.log({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
});

// Single shared Brevo transporter — created once, reused everywhere
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("Transporter options:", transporter.options);

// Verify SMTP connection on startup (full error output)
(async () => {
  try {
    await transporter.verify();
    console.log("✅ Brevo SMTP Connected");
  } catch (err) {
    console.error("SMTP VERIFY ERROR:", err);
  }
})();

const sendMail = async (email, otp) => {
  try {
    console.log({
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_USER: process.env.EMAIL_USER,
    });
    await transporter.sendMail({
      from: `"Chatly" <${process.env.EMAIL_FROM}>`,
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

export const sendPasswordResetMail = async (email, otp) => {
  try {
    console.log({
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_USER: process.env.EMAIL_USER,
    });
    await transporter.sendMail({
      from: `"Chatly" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Chatly Password Reset OTP",
      text: `Hello,\n\nYour Chatly password reset OTP is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\n- Chatly Team`,
    });

    return true;
  } catch (error) {
    console.log("Password reset mail sending error:", error);
    return false;
  }
};
