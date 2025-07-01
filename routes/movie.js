import express from "express";
import movieController from "../controller/moviesController.js";

const router = express.Router()

router.get("/", movieController.index)
router.get("/:slug", movieController.show)
router.post("/", movieController.store)
router.post("/:id/reviews", movieController.storeReviews)

export default router

