import { Router } from "express";

import User, { UserDocument } from "#/models/user";
import { CreateUser, RequestWithFiles } from "#/@types/user";
import { validate } from "#/middleware/validator";
import { v2 as cloudinary } from "cloudinary";
import {
  CreateUserSchema,
  IDandTokenValidationSchema,
  PasswordResetValidationSchema,
  SignInValidationSchema,
} from "#/utils/validationSchema";
import {
  createUser,
  forgetPassword,
  grantValid,
  logoutUser,
  sendProfile,
  sendReverificationToken,
  signInUser,
  updatePassword,
  updateProfile,
  verifyToken,
} from "#/controllers/auth";
import { mustAuth } from "#/middleware/auth";
import { fileParser } from "#/middleware/file-parse";

const router = Router();

router.post("/create", validate(CreateUserSchema), createUser);
router.post("/verify-token", validate(IDandTokenValidationSchema), verifyToken);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", forgetPassword);
router.post(
  "/verify-reset-token",
  validate(IDandTokenValidationSchema),
  grantValid
);
router.post(
  "/update-password",
  validate(PasswordResetValidationSchema),
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signInUser);
router.post("/is-valid-token", mustAuth, sendProfile);

router.post("/update-profile", mustAuth, fileParser, updateProfile);
router.post("/logout", mustAuth, logoutUser);
// , async (req, res) => {
//   if (!req.headers["content-type"]?.startsWith("multipart/form-data"))
//     return res.status(422).json({ error: "Only acceps form data" });
//   const dir = path.join(__dirname, "../public/profiles");
//   try {
//     fs.readdirSync(dir);
//   } catch (e) {
//     fs.mkdirSync(dir);
//   }

//   const form = formidable({
//     uploadDir: dir,
//     filename(name, ext, part, form) {
//       return `${Date.now()}_${part.originalFilename}`;
//     },
//   });
//   const [fields, files] = await form.parse(req);
//   res.json({ valid: true });
// });

export default router;
