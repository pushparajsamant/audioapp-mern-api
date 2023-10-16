import {
  addToPlaylist,
  createPlaylist,
  getPlaylist,
  getSongsFromPlaylist,
  removePlaylist,
} from "#/controllers/playlist";
import { mustAuth } from "#/middleware/auth";
import { isVerified } from "#/middleware/is-verified";
import { validate } from "#/middleware/validator";
import {
  PlaylistValidationScheme,
  UpdatePlaylistValidationScheme,
} from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();
router.get("/", mustAuth, isVerified, getPlaylist);
router.get("/:id", mustAuth, getSongsFromPlaylist);
router.post(
  "/create",
  mustAuth,
  isVerified,
  validate(PlaylistValidationScheme),
  createPlaylist
);
router.patch(
  "/update",
  mustAuth,
  validate(UpdatePlaylistValidationScheme),
  addToPlaylist
);
router.delete("/", mustAuth, isVerified, removePlaylist);

export default router;
