import { RequestWithFiles } from "#/@types/user";
import { RequestHandler } from "express";
import formidable from "formidable";

export const fileParser: RequestHandler = async (
  req: RequestWithFiles,
  res,
  next
) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data"))
    return res.status(422).json({ error: "Only acceps form data" });

  const form = formidable({ multiples: false });
  const [fields, files] = await form.parse(req);

  for (let key in fields) {
    let value = fields[key];
    if (value) {
      req.body[key] = value[0];
    }
  }
  if (!req.files) {
    req.files = {};
  }
  for (let key in files) {
    let value = files[key];
    if (value) {
      req.files[key] = value[0];
    }
  }
  next();
};
