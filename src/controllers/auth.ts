import {
  CreateUser,
  RequestWithFiles,
  VerifyEmailRequest,
  VerifyResetTokenRequest,
} from "#/@types/user";
import User from "#/models/user";
import jwt, { JwtPayload } from "jsonwebtoken";
import EmailVerificationToken, {
  VerificationTokenDocument,
} from "#/models/emailVerification";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  JWT_SECRET,
  MAILTRAP_PASSWORD,
  MAILTRAP_USERNAME,
} from "#/utils/variables";
import { RequestHandler } from "express";
import {
  sendEmail,
  sendPasswordResetSuccessEmail,
  sendResetEmail,
  sendVerificationEmail,
} from "#/utils/mail";
import { isValidObjectId } from "mongoose";
import PasswordResetToken, {
  PasswordResetDocument,
} from "#/models/passwordResetToken";
import cloudinary from "#/cloud";
import { File } from "formidable";
import user from "#/models/user";

export const createUser: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(403).json({ error: "Email already in use" });
  }
  const newUser = await User.create({
    email,
    password,
    name,
  });
  console.log(newUser._id.toString());
  sendVerificationEmail({
    userId: newUser._id.toString(),
    name,
    email,
  });

  res.status(201).json(newUser);
};

export const sendReverificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(userId)) {
    return res.status(403).json({ error: "Invalid Request" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(403).json({ error: "Invalid Request" });
  }
  if (user.verified) {
    return res.status(422).json({ error: "Account already verified" });
  }

  const emailVerificationToken = await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  sendVerificationEmail({
    userId: user._id.toString(),
    name: user?.name,
    email: user?.email,
  });
  res.status(200).json({ message: "Verification Email Sent" });
};

export const verifyToken: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { userId, token } = req.body;
  const verificationObjectFromDB = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (verificationObjectFromDB) {
    const result = await verificationObjectFromDB.compareToken(token);
    if (result) {
      res.status(200).json({ verified: true });
      await User.findByIdAndUpdate(userId, {
        verified: true,
      });
      await verificationObjectFromDB.deleteOne();
      return;
    }
  }
  res.status(403).json({ verified: false });
};

export const forgetPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ error: "Invalid Input" });
    }
    sendResetEmail({
      email,
      name: user.name,
      userId: user._id.toString(),
    });
    return res.send({ message: "Password reset email sent" });
  } catch (e) {
    console.log(e);
  }
};
export const grantValid: RequestHandler = (req, res) => {
  return res.status(200).json({ valid: true });
};
export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;

  if (!(typeof name == "string"))
    return res.status(422).json({ error: "Invalid Data" });

  const avatar = req.files?.avatar as File;
  const user = await User.findById(req.user.id);
  if (!user) return res.send(500).json({ error: "Something went wrong." });

  user.name = name;
  //If user avatar is already available delete the existing
  if (user.avatar) {
    const resultOfDeletion = await cloudinary.uploader.destroy(
      user.avatar.publicId
    );
    console.log(resultOfDeletion);
  }
  if (!user)
    return res
      .status(403)
      .json({ error: "Something went wrong. Avatar not updated." });

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    avatar.filepath,
    {
      width: 300,
      height: 300,
      gravity: "face",
      crop: "thumb",
    }
  );
  user.avatar = {
    url: secure_url,
    publicId: public_id,
  };
  await user.save();
  return res.status(200).json({ profile: formatProfile(user) });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { userId, password } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Invalid Request" });

  const matches = await user.comparePassword(password);
  if (matches)
    return res.status(403).json({ error: "Please provide a new password." });
  sendPasswordResetSuccessEmail(user.email);
  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });
  user.password = password;
  await user.save();
  res.status(200).json("Password Reset Success");
};
export const signInUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Email/Password Mismatch!" });
  const matched = await user.comparePassword(password);
  if (!matched)
    return res.status(401).json({ error: "Email/Password Mismatch!" });

  //generate token
  const token = jwt.sign({ user: user._id }, JWT_SECRET);
  user.tokens.push(token);
  await user.save();

  return res.status(200).json({
    profile: formatProfile(user),
    token: token,
  });
};
export const sendProfile: RequestHandler = (req, res) => {
  return res.json({ profile: req.user });
};
export const logoutUser: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(500).json({ error: "Something went wrong." });

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((token) => token != req.token);
  await user.save();
  return res.json({ message: "Successfully Logged Out" });
};
