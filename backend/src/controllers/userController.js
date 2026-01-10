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

    // Check env vars presence
    if (!process.env.CLERK_SECRET_KEY) console.error("❌ [SYNC] Missing CLERK_SECRET_KEY");
    if (!process.env.STREAM_API_KEY) console.error("❌ [SYNC] Missing STREAM_API_KEY");

    // Fetch user details from Clerk
    console.log("🔍 [SYNC] Fetching user from Clerk...");
    const user = await clerkClient.users.getUser(userId);
    console.log("✅ [SYNC] User fetched from Clerk:", user.emailAddresses[0]?.emailAddress);

    const { firstName, lastName, emailAddresses, imageUrl } = user;
    const email = emailAddresses[0]?.emailAddress || "";

    // Sync user to Stream
    console.log("🔍 [SYNC] Upserting user to Stream...");
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
      // Don't block DB sync if Stream fails, but log it critical
    }

    // Check if user already exists in DB
    console.log("🔍 [SYNC] Checking MongoDB for user...");
    let dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      console.log("🔍 [SYNC] Creating NEW user in MongoDB...");
      dbUser = new User({
        clerkId: userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: email,
        profileImage: imageUrl || "",
      });

      await dbUser.save();
      console.log("✅ [SYNC] New user created:", dbUser._id);
    } else {
      console.log("🔍 [SYNC] Updating EXISTING user in MongoDB...");
      dbUser.name = `${firstName || ""} ${lastName || ""}`.trim();
      dbUser.email = email;
      dbUser.profileImage = imageUrl || "";
      await dbUser.save();
      console.log("✅ [SYNC] User updated:", dbUser._id);
    }

    res.status(200).json({
      message: "User synced successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("💥 [SYNC] CRITICAL ERROR in syncUserToDb:", error); // Log full error object
    console.error("💥 [SYNC] Error Stack:", error.stack);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
