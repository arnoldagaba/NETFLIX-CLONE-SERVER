import { Router } from "express";
import favoriteRoutes from "./favorite.routes.js";
import movieRoutes from "./movie.routes.js";
import tvRoutes from "./tv.routes.js";
import userRoutes from "./user.routes.js";
import watchlistRoutes from "./watchlist.routes.js";

const router: Router = Router();

router.use("/user", userRoutes);
router.use("/movies", movieRoutes);
router.use("/tv", tvRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/favorites", favoriteRoutes);

export default router;
