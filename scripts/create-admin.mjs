
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!uri || !email || !password) {
    throw new Error(
      "Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local"
    );
  }

  if (password.length < 12) {
    throw new Error("Use an admin password of at least 12 characters.");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const admins = mongoose.connection.db.collection("admins");
    const passwordHash = await bcrypt.hash(password, 12);

    const existingAdmin = await admins.findOne({ email });

    if (existingAdmin) {
      // Update the existing account without changing its _id.
      await admins.updateOne(
        { _id: existingAdmin._id },
        {
          $set: { email, passwordHash },
          $unset: { password: "" },
        }
      );

      console.log("Existing admin password updated successfully.");
    } else {
      await admins.insertOne({
        email,
        passwordHash,
        createdAt: new Date(),
      });

      console.log("Admin account created successfully.");
    }

    console.log(`Admin email: ${email}`);
    console.log("You can now try logging in.");
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
});
