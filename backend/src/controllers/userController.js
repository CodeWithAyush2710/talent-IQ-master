import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

import { clerkClient } from "@clerk/express";

export async function syncUserToDb(req, res) {
  try {
    const { userId } = req.auth();
    console.log("🔍 [SYNC] Starting sync for user:", userId);

    if (!userId) {
      console.error("❌ [SYNC] No userId found in req.auth()");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    console.log("✅ [SYNC] User fetched from Clerk:", user.id);
    const { firstName, lastName, emailAddresses, imageUrl } = user;
    const email = emailAddresses[0]?.emailAddress || "";

    // Sync user to Stream
    try {
      await upsertStreamUser({
        id: userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        image: imageUrl || "",
        email: email,
      });
      console.log("✅ [SYNC] Stream upsert successful");
    } catch (streamError) {
      console.error("❌ [SYNC] Stream upsert failed:", streamError.message);
    }

    // Check if user already exists in DB
    let dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      // Fallback: Check by email to prevent duplicate key error if user exists but has different/missing clerkId
      dbUser = await User.findOne({ email });
    }

    if (dbUser) {
      // Update existing user
      dbUser.clerkId = userId; // Ensure Clerk ID is linked
      dbUser.name = `${firstName || ""} ${lastName || ""}`.trim();
      dbUser.email = email;
      dbUser.profileImage = imageUrl || "";
      await dbUser.save();
      console.log("✅ [SYNC] Existing user updated in DB");
    } else {
      // Create new user
      dbUser = new User({
        clerkId: userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: email,
        profileImage: imageUrl || "",
      });

      await dbUser.save();
      console.log("✅ [SYNC] New user created in DB");
    }

    res.status(200).json({
      message: "User synced successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("💥 [SYNC] CRITICAL ERROR in syncUserToDb:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
