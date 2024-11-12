const verifyEmailTemplate = (name, url) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
      width: 80%;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    ">
      <h2 style="color: #333;">Welcome to Blinkit, ${name}!</h2>
      <p style="color: #555;">
        Thank you for registering with Blinkit! Please click the button below to
        verify your email address and complete your registration.
      </p>
      <a href="${url}" style="
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        font-size: 16px;
        color: #fff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
      ">
        Verify Email
      </a>
      <p style="color: #777;">
        If you did not create an account, no further action is required.
      </p>
      <p style="color: #777;">
        Regards,<br/>
        The Blinkit Team
      </p>
    </div>
  `;
};

export default verifyEmailTemplate;
