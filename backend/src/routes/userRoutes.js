import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { syncUserToDb } from "../controllers/userController.js";

const router = express.Router();

// Sync user from Clerk to MongoDB (call this after login)
router.post("/sync", protectRoute, syncUserToDb);

export default router;
