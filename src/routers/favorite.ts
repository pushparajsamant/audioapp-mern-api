import { listFavorites, toggleFavorite } from "#/controllers/favorite";
import { mustAuth } from "#/middleware/auth";
import { isVerified } from "#/middleware/is-verified";
import { validate } from "#/middleware/validator";
import { FavoriteValidationSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();
router.post("/", mustAuth, isVerified, toggleFavorite);
router.get("/", mustAuth, listFavorites);
export default router;
