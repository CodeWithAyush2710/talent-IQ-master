import User from "../models/User.js";

export async function syncUserToDb(req, res) {
  try {
    const clerkUser = req.auth();
    const { firstName, lastName, emailAddresses, imageUrl } = clerkUser;

    console.log("🔍 Syncing user:", clerkUser.userId); // Debug log

    if (!clerkUser.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already exists in DB
    let user = await User.findOne({ clerkId: clerkUser.userId });

    if (!user) {
      // Create new user
      user = new User({
        clerkId: clerkUser.userId,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        email: emailAddresses[0]?.emailAddress || "",
        profileImage: imageUrl || "",
      });

      await user.save();
      console.log("✅ New user created:", user._id); // Debug log
    } else {
      // Update existing user (in case profile changed)
      user.name = `${firstName || ""} ${lastName || ""}`.trim();
      user.email = emailAddresses[0]?.emailAddress || "";
      user.profileImage = imageUrl || "";
      await user.save();
      console.log("✅ User updated:", user._id); // Debug log
    }

    res.status(200).json({
      message: "User synced successfully",
      user,
    });
  } catch (error) {
    console.error("Error in syncUserToDb:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
