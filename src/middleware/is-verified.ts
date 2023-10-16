import { RequestHandler } from "express";

export const isVerified: RequestHandler = (req, res, next) => {
  if (!req.user.verified)
    return res.status(403).json({ error: "Please verify your email" });
  next();
};
