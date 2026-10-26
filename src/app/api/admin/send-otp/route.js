import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Admin from "@/models/Admin";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/digital-paaji");
};

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized admin email." }, { status: 401 });
    }

    // Generate 6-digit OTP (For testing/development, logs to console or returns in response)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await admin.save();

    console.log(`🔑 ADMIN OTP for ${email}: ${otp}`); // Check your terminal console for the OTP code

    return NextResponse.json({ success: true, message: "OTP sent to registered email (check server console)." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}