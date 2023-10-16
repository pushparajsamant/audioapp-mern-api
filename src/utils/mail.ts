import path from "path";
import nodemailer from "nodemailer";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USERNAME,
  PASSWORD_RESET_LINK,
  SIGNIN_LINK,
} from "./variables";
import { Options, generateTemplate } from "#/mail/template";
import Mail from "nodemailer/lib/mailer";
import { generateToken } from "./helper";
import EmailVerificationToken from "#/models/emailVerification";
import PasswordResetToken from "#/models/passwordResetToken";

export interface Profile {
  userId: string;
  name: string;
  email: string;
}
export const sendEmail = (
  emailAddress: string,
  options: Options,
  attachments: Mail.Attachment[]
) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USERNAME,
      pass: MAILTRAP_PASSWORD,
    },
  });
  transport.sendMail({
    to: emailAddress,
    subject: "Password Reset for Podify",
    from: "auth@ps.com",
    html: generateTemplate(options),
    attachments: attachments,
  });
};

export const sendResetEmail = async (profile: Profile) => {
  try {
    const { email, name, userId } = profile;
    const token = crypto.randomUUID();
    await PasswordResetToken.findOneAndDelete({
      owner: userId,
    });
    await PasswordResetToken.create({
      owner: userId,
      token: token,
    });
    const link = `${PASSWORD_RESET_LINK}?token=${token}&userId=${userId}`;

    const message = `We just received a request from you to reset your password. No problem you can click on the below link to reset your password..`;
    const emailOptions: Options = {
      title: "Reset Password",
      message: message,
      link: link,
      logo: "cid:logo",
      banner: "cid:banner",
      btnTitle: "Reset Password",
    };
    const attachments = [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "banner",
      },
    ];
    sendEmail(email, emailOptions, attachments);
  } catch (e) {
    console.log(e);
  }
};
export const sendVerificationEmail = async (profile: Profile) => {
  try {
    const { email, userId, name } = profile;
    const token = generateToken(6);
    const message = `Welcome ${name} to Podify! There are so many features we provide for verified users. Use the given OTP to verify your email.`;
    const emailOptions: Options = {
      title: "Welcome to Podify",
      message: message,
      link: "#",
      logo: "cid:logo",
      banner: "cid:banner",
      btnTitle: token,
    };
    const attachments = [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "banner",
      },
    ];
    sendEmail(email, emailOptions, attachments);
    const newVerificationToken = await EmailVerificationToken.create({
      owner: userId,
      token: token,
    });
  } catch (e) {
    console.log(e);
  }
};
export const sendPasswordResetSuccessEmail = (email: string) => {
  const message = `Password reset successfully.`;
  const emailOptions: Options = {
    title: "Password Reset Success",
    message: message,
    link: SIGNIN_LINK,
    logo: "cid:logo",
    banner: "cid:banner",
    btnTitle: "SIGN-IN",
  };
  const attachments = [
    {
      filename: "logo.png",
      path: path.join(__dirname, "../mail/logo.png"),
      cid: "logo",
    },
    {
      filename: "welcome.png",
      path: path.join(__dirname, "../mail/welcome.png"),
      cid: "banner",
    },
  ];
};
