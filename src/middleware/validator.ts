import { RequestHandler } from "express";
import * as yup from "yup";
export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body) return res.status(422).json({ error: "Empty message body" });
    const schemaToValidate = yup.object({
      body: schema,
    });
    try {
      await schema.validate(req.body, { abortEarly: true });
      next();
    } catch (e) {
      if (e instanceof yup.ValidationError) {
        res.status(422).json({ error: e.message });
      }
    }
  };
};
