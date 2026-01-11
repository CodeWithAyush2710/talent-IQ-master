import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

import { clerkClient } from "@clerk/express";

export async function syncUserToDb(req, res) {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);
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
    } catch (streamError) {
      console.error("Stream upsert failed:", streamError.message);
    }

    // Check if user already exists in DB
    let dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      dbUser = new User({
        clerkId: userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: email,
        profileImage: imageUrl || "",
      });

      await dbUser.save();
    } else {
      dbUser.name = `${firstName || ""} ${lastName || ""}`.trim();
      dbUser.email = email;
      dbUser.profileImage = imageUrl || "";
      await dbUser.save();
    }

    res.status(200).json({
      message: "User synced successfully",
      user: dbUser,
    });
  } catch (error) {
    console.error("Error in syncUserToDb:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
