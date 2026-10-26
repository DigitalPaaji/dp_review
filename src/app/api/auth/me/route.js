import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Client from "@/models/Client";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    await connectDB();

    if (session.role === "admin") {
      const admin = await Admin.findById(session.userId).select("_id email");

      if (!admin) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }

      return NextResponse.json({
        authenticated: true,
        role: "admin",
        user: { email: admin.email },
      });
    }

    const client = await Client.findById(session.userId).select(
      "_id email businessName placeId googleUrl hasGeneratedQr savedQrUrl expiryDate"
    );

    if (!client || new Date(client.expiryDate) <= new Date()) {
      return NextResponse.json(
        { authenticated: false, message: "Subscription expired or account unavailable." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      role: "client",
      client,
    });
  } catch (error) {
    console.error("Session check failed:", error.message);

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}