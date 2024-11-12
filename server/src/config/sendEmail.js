import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "blinkit <onboarding@resend.dev>",
      to: sendTo,
      subject: subject,
      html: html,
    });

    if (response.error) {
      console.error("Error in sending email:", response.error);
      throw new Error(response.error.message || "Unknown email sending error.");
    }

    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in sendEmail function:", error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

export default sendEmail;
