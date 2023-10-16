import {
  getLatestUploads,
  updateAudio,
  uploadAudio,
} from "#/controllers/audio";
import { mustAuth } from "#/middleware/auth";
import { fileParser } from "#/middleware/file-parse";
import { isVerified } from "#/middleware/is-verified";
import { validate } from "#/middleware/validator";
import {
  AudioValidationSchema,
  FavoriteValidationSchema,
} from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  mustAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  uploadAudio
);
router.patch(
  "/update/:id",
  mustAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  updateAudio
);
router.get("/latest", getLatestUploads);
export default router;
