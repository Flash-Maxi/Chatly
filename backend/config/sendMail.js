import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends a transactional email via Brevo v3 REST API.
 */
const sendBrevoEmail = async ({ to, subject, htmlContent, textContent }) => {
  const payload = {
    sender: {
      name: "Chatly",
      email: process.env.EMAIL_FROM,
    },
    to: [{ email: to }],
    subject,
  };

  if (htmlContent) payload.htmlContent = htmlContent;
  if (textContent) payload.textContent = textContent;

  const response = await axios.post(BREVO_API_URL, payload, {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response;
};

/**
 * Sends an OTP verification email.
 */
const sendMail = async (email, otp) => {
  try {
    console.log("Sending verification mail to:", email);

    const response = await sendBrevoEmail({
      to: email,
      subject: "Verify your Chatly account",
      htmlContent: `
        <div style="font-family: Arial, sans-serif">
          <h2>Chatly Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("Mail sent:", response.data);
    return true;
  } catch (err) {
    console.error("Verification mail error:");
    console.error(err.response ? err.response.data : err.message);
    return false;
  }
};

export default sendMail;

/**
 * Sends a password reset OTP email.
 */
export const sendPasswordResetMail = async (email, otp) => {
  try {
    console.log("Sending password reset mail to:", email);

    const response = await sendBrevoEmail({
      to: email,
      subject: "Chatly Password Reset OTP",
      textContent: `Your Chatly password reset OTP is ${otp}. It expires in 5 minutes.`,
    });

    console.log("Password reset mail sent:", response.data);
    return true;
  } catch (err) {
    console.error("Password reset mail error:");
    console.error(err.response ? err.response.data : err.message);
    return false;
  }
};