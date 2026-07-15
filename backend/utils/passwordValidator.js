/**
 * passwordValidator.js
 * Shared backend utility for strong-password validation.
 * Import wherever a password must be validated before hashing.
 */

// Must satisfy ALL five criteria simultaneously.
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]).{8,}$/;

/**
 * Validates that a password satisfies all strength requirements.
 *
 * @param {string} password
 * @returns {{ valid: boolean, message: string | null }}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required." };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number.",
    };
  }

  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character.",
    };
  }

  return { valid: true, message: null };
};

export default validatePassword;
