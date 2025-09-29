function verificationEmailTemplate(fullName, url) {
  return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello ${fullName},</h2>
            <p>
                Thank you for registering with Chatify! Please verify your email address by clicking the button below:
            </p>
            <p style="text-align: center;">
                <a href="${url}" style="background: #4f8cff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
            </p>
            <p>
                If you did not create an account, please ignore this email.
            </p>
            <hr>
            <small>
                &copy; ${new Date().getFullYear()} Chatify. All rights reserved.
            </small>
        </div>
    `;
}

export default verificationEmailTemplate;
