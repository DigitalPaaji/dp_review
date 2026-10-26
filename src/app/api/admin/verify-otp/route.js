import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Admin from "@/models/Admin";
import Client from "@/models/Client";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/digital-paaji");
};

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp, action, clientData } = await req.json();

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || admin.otp !== otp || new Date() > new Date(admin.otpExpires)) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 401 });
    }

    // If action is creating a new client
    if (action === "create_client") {
      const { newEmail, newPassword, newBusinessName, newPlaceId, newGoogleUrl } = clientData;
      const existing = await Client.findOne({ email: newEmail });
      if (existing) return NextResponse.json({ error: "Client already exists." }, { status: 400 });

      const newClient = await Client.create({
        email: newEmail,
        password: newPassword,
        businessName: newBusinessName,
        placeId: newPlaceId,
        googleUrl: newGoogleUrl,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      return NextResponse.json({ success: true, client: newClient }, { status: 200 });
    }

    // Default: Fetch all clients for admin view
    const clients = await Client.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, clients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}