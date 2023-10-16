import User from "#/models/user";
import { JWT_SECRET } from "#/utils/variables";
import { RequestHandler } from "express";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import { VerifyResetTokenRequest } from "#/@types/user";
import PasswordResetToken from "#/models/passwordResetToken";

export const mustAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return res.status(403).json({ error: "Unauthorized Request" });

  const token = authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ error: "Unauthorized Request" });

  const result = jwt.verify(token, JWT_SECRET) as JwtPayload;
  if (!result) return res.status(403).json({ error: "Unauthorized Request" });

  const userId = result.user;
  const user = await User.findOne({ _id: userId, tokens: token });
  if (!user) return res.status(403).json({ error: "Unauthorized Request" });

  req.user = {
    email: user.email,
    name: user.name,
    avatar: user.avatar?.url,
    verified: user.verified,
    id: user._id,
    followers: user.followers.length,
    following: user.following.length,
  };
  req.token = token;
  next();
};

export const verifyResetToken: RequestHandler = async (
  req: VerifyResetTokenRequest,
  res,
  next
) => {
  const { userId, token } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Invalid Request" });

  const resetTokenFromDB = await PasswordResetToken.findOne({
    owner: user._id,
  });
  if (!resetTokenFromDB)
    return res.status(403).json({ error: "Invalid Request. Unauthorized." });
  const result = resetTokenFromDB?.compareToken(token);
  if (!result)
    return res.status(403).json({ error: "Invalid Request. Unauthorized." });
  next();
};

export const isAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];

  if (token) {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const id = payload.user;

    const user = await User.findOne({ _id: id, tokens: token });
    if (!user) return res.status(403).json({ error: "Unauthorized request!" });

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      following: user.following.length,
    };
    req.token = token;
  }

  next();
};
