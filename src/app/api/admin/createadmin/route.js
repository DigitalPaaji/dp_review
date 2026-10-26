
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  let step = "Reading request";

  try {
    const { email, password } = await req.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // STEP 1: Connect to MongoDB
    step = "Connecting to MongoDB";
    await connectDB();
    console.log("[ADMIN LOGIN] MongoDB connected");

    // STEP 2: Find admin
    step = "Finding admin account";

    const normalizedEmail = email.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 12);

    
const admin = await Admin.create({
  email: normalizedEmail,
  passwordHash: hashedPassword,
});
return NextResponse.json(
  {
    success: true,
    message: "Admin created successfully.",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  },
  { status: 201 }
);
    
   
  } catch (error) {
    // Detailed error goes to the server terminal, not the browser.
    console.error(`[ADMIN LOGIN] Failed at: ${step}`);
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to log in right now.",
        debug: step,
      },
      { status: 500 }
    );
  }
}

