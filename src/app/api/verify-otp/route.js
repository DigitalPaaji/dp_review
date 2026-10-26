
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import otpModel from "@/models/otpModel";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export const POST = async (req) => {
  try {
    await connectDB();

    // 1. Parse request body
    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const businessName =
      typeof body.businessName === "string"
        ? body.businessName.trim()
        : "";

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    // 2. Validate required fields
    if (!email || !password || !businessName || !otp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, password, business name and OTP are required.",
        },
        { status: 400 }
      );
    }

    // 3. Validate field lengths
    if (
      email.length > 254 ||
      businessName.length > 150 ||
      password.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
        { status: 400 }
      );
    }

    // 4. Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // 5. Validate password
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // 6. Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit OTP.",
        },
        { status: 400 }
      );
    }

    // 7. Check whether the account already exists
    const alreadyExists = await Client.findOne({ email });

    if (alreadyExists) {
      await otpModel.deleteOne({ email });

      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // 8. Find OTP
    const getOtp = await otpModel.findOne({ email });

    if (!getOtp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found. Please request a new verification code.",
        },
        { status: 400 }
      );
    }

    // 9. Check OTP expiration
    if (
      !getOtp.expiryDate ||
      new Date(getOtp.expiryDate).getTime() <= Date.now()
    ) {
      await otpModel.deleteOne({ _id: getOtp._id });

      return NextResponse.json(
        {
          success: false,
          message: "Your OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // 10. Verify OTP
    if (String(getOtp.otp) !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect OTP. Please try again.",
        },
        { status: 400 }
      );
    }

    // 11. Hash password
    const hashPassword = await bcrypt.hash(password, 12);
  const expiryDate = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    );
  
  
    await Client.create({
      email,
      passwordHash: hashPassword,
      businessName,
      expiryDate
    });

    // 13. Delete OTP after successful registration
    await otpModel.deleteOne({ _id: getOtp._id });

    // 14. Send success response
    return NextResponse.json(
      {
        success: true,
        message: "Email verified and account created successfully.",
        
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OTP verification and registration error:", error);

    // Handle duplicate email in case of concurrent registrations
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify OTP or create your account right now.",
      },
      { status: 500 }
    );
  }
};
