import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  return res.status(500).json({ error: "Some error occured" });
};
