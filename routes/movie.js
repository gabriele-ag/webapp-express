import express from "express";
import movieController from "../controller/moviesController.js";
import upload from "../middleware/upload.js";

const router = express.Router()

router.get("/", movieController.index)
router.get("/:slug", movieController.show)
router.post("/", upload.single("image"), movieController.store)
router.post("/:id/reviews", movieController.storeReviews)
router.delete("/:slug", movieController.destroy)


export default router

