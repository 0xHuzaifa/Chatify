import nodeMailer from "nodemailer";
import ApiError from "../utils/ApiError.js";

const createTransporter = () => {
  try {
    // Support both SMTP_USER (current .env) and older SMTP_MAIL name
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_MAIL;
    const smtpPass = process.env.SMTP_PASS;

    const transportOptions = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      // Add timeout and connection settings if desired
      // connectionTimeout: 5000,
      // greetingTimeout: 5000,
    };

    // Only include auth if both user and pass are provided. This avoids
    // passing an empty auth object which causes "Missing credentials for PLAIN".
    if (smtpUser && smtpPass) {
      transportOptions.auth = {
        user: smtpUser,
        pass: smtpPass,
      };
    }

    const transporter = nodeMailer.createTransport(transportOptions);

    return transporter;
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw error;
  }
};

const sendEmail = async (emailOrOptions, subjectArg, messageArg) => {
  // Support both sendEmail({ email, subject, message }) and sendEmail(email, subject, message)
  let email, subject, message;
  if (typeof emailOrOptions === "object" && emailOrOptions !== null) {
    email = emailOrOptions.email;
    subject = emailOrOptions.subject;
    message = emailOrOptions.message;
  } else {
    email = emailOrOptions;
    subject = subjectArg;
    message = messageArg;
  }

  try {
    const transporter = createTransporter();

    // Verify connection before sending (nodemailer supports Promise if no callback provided)
    try {
      await transporter.verify();
    } catch (verifyErr) {
      // If verification failed because credentials are missing, provide a clearer error
      if (verifyErr && verifyErr.code === "EAUTH") {
        console.error(
          "SMTP auth failed - check SMTP_USER/SMTP_PASS or Gmail app password.",
          verifyErr
        );
      }
      throw verifyErr;
    }

    const fromAddress =
      process.env.SMTP_USER ||
      process.env.SMTP_MAIL ||
      `no-reply@${process.env.SMTP_HOST || "localhost"}`;

    const options = {
      from: fromAddress,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(options);
    console.log("Email sent successfully to", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    // Throw an ApiError so callers can handle failures via try/catch
    throw new ApiError(500, "Failed to send email", [error.message || error]);
  }
};

export default sendEmail;
