import User from "../models/User.js";

import { clerkClient } from "@clerk/express";

export async function syncUserToDb(req, res) {
  try {
    const { userId } = req.auth();
    console.log("🔍 Syncing user:", userId); // Debug log

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    const { firstName, lastName, emailAddresses, imageUrl } = user;
    const email = emailAddresses[0]?.emailAddress || "";

    // Check if user already exists in DB
    let dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      // Create new user
      dbUser = new User({
        clerkId: userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: email,
        profileImage: imageUrl || "",
      });

      await dbUser.save();
      console.log("✅ New user created:", dbUser._id); // Debug log
    } else {
      // Update existing user (in case profile changed)
      dbUser.name = `${firstName || ""} ${lastName || ""}`.trim();
      dbUser.email = email;
      dbUser.profileImage = imageUrl || "";
      await dbUser.save();
      console.log("✅ User updated:", dbUser._id); // Debug log
    }

    res.status(200).json({
      message: "User synced successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("Error in syncUserToDb:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
