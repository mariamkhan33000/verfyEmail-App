import resend from "./config.js";
import { verificationTokenEmailTemplate, WELCOME_EMAIL_TEMPLATE } from "./email-templates.js";

const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Verify Your Email Address Now",
            html: verificationTokenEmailTemplate.replace(
                "{verificationToken}",
                verificationToken
            )
          });
    } catch (error) {
        console.log("error sending verification email", error);
        throw new error("Error sending verificaton email")
    }
}

export default sendVerificationEmail;


export const sendWelcomeEmail = async (email, name) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Welcome to our company",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
          });
    } catch (error) {
        console.log("error sending welcome email", error);
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Reset Your Password",
            html: `Click Here <a href = "${resetURL}">here</a> to reset your password`
          });
    } catch (error) {
        console.log("error reset password email", error);
    }
}