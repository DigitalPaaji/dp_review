import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
     
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const client = await Client.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!client || !(await bcrypt.compare(password, client.passwordHash))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!client.expiryDate || new Date(client.expiryDate) <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Your subscription has expired." },
        { status: 403 }
      );
    }



    

    const response = NextResponse.json({
      success: true,
      client: {
        _id: String(client._id),
        email: client.email,
        businessName: client.businessName,
        placeId: client.placeId,
        googleUrl: client.googleUrl,
        hasGeneratedQr: client.hasGeneratedQr,
        savedQrUrl: client.savedQrUrl,
        expiryDate: client.expiryDate,
      },
    });

    await createSession(client._id, "client", response);
    return response;
  } catch (error) {
    console.error("Client login failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to log in right now." },
      { status: 500 }
    );
  }
} 