import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      console.log("🔍 [AUTH] protectRoute checking user:", clerkId);

      if (!clerkId) {
        console.error("❌ [AUTH] No Clerk ID found in token");
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      // find user in db by clerk ID
      const user = await User.findOne({ clerkId });

      if (!user) {
        console.error("❌ [AUTH] User NOT found in MongoDB for Clerk ID:", clerkId);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("✅ [AUTH] User verified:", user._id);
      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("💥 [AUTH] Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
