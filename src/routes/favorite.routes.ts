import { Router } from "express";
import {
	addToFavorites,
	checkFavoriteStatus,
	getFavorites,
	removeFromFavorites,
} from "#controllers/favorite.controller.js";
import { requireAuth } from "#middleware/auth.middleware.js";

const router: Router = Router();

router.get("/", requireAuth, getFavorites);
router.post("/", requireAuth, addToFavorites);
router.delete("/:id", requireAuth, removeFromFavorites);
router.get("/check", requireAuth, checkFavoriteStatus);

export default router;
