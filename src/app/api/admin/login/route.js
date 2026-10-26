
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

    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    console.log("[ADMIN LOGIN] Admin found:", Boolean(admin));

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // STEP 3: Check password hash
    step = "Checking password hash";

    if (
      typeof admin.passwordHash !== "string" ||
      !admin.passwordHash
    ) {
      console.error("[ADMIN LOGIN] passwordHash is missing");
      return NextResponse.json(
        {
          success: false,
          message: "Admin password is not configured correctly.",
        },
        { status: 500 }
      );
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    console.log("[ADMIN LOGIN] Password valid:", passwordIsValid);

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // STEP 4: Create session and cookie
    step = "Creating admin session";

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully.",
    });
          
    await createSession(admin._id, "admin", response);

    console.log("[ADMIN LOGIN] Session created successfully");

    return response;
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




// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import connectDB from "@/lib/mongodb";
// import Admin from "@/models/Admin";
// import { createSession } from "@/lib/auth";

// export const runtime = "nodejs";

// export async function POST(req) {
//   try {
//     const { email, password } = await req.json();

//     if (
//       typeof email !== "string" ||
//       typeof password !== "string" ||
//       !email.trim() ||
//       !password
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Email and password are required." },
//         { status: 400 }
//       );
//     }

//     await connectDB();

//     const admin = await Admin.findOne({
//       email: email.trim().toLowerCase(),
//     }).select("+passwordHash");

//     if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
//       return NextResponse.json(
//         { success: false, message: "Invalid email or password." },
//         { status: 401 }
//       );
//     }

//     const response = NextResponse.json({
//       success: true,
//       message: "Admin authenticated successfully.",
//     });

//     await createSession(admin._id, "admin", response);
//     return response;
//   } catch (error) {
//     console.error("Admin login failed:", error.message);

//     return NextResponse.json(
//       { success: false, message: "Unable to log in right now." },
//       { status: 500 }
//     );
//   }
// }