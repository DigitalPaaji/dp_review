import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function safeClient(client) {
  return {
    _id: String(client._id),
    email: client.email,
    businessName: client.businessName,
    placeId: client.placeId,
    googleUrl: client.googleUrl,
    hasGeneratedQr: client.hasGeneratedQr,
    savedQrUrl: client.savedQrUrl,
    expiryDate: client.expiryDate,
    createdAt: client.createdAt,
  };
}

export async function GET(req) {
  try {
  
    const session = await getSession(req);
   
    if (!session || session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Admin access required."},
        { status: 403 }
      );
    }

    await connectDB();
    const client = await Client.findById(session.userId);

    return NextResponse.json({
      success: true,
      client,
    });




  } catch (error) {
    console.error("Fetch clients failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to fetch clients." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getSession(req);

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
    const password = body.password;
    const businessName = typeof body.businessName === "string"
      ? body.businessName.trim()
      : "";
    const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
    const googleUrl = typeof body.googleUrl === "string" ? body.googleUrl.trim() : "";

    if (
      !email ||
      typeof password !== "string" ||
      password.length < 12 ||
      !businessName ||
      !placeId ||
      !googleUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide valid business details and a password of at least 12 characters.",
        },
        { status: 400 }
      );
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(googleUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Enter a valid Google review URL." },
        { status: 400 }
      );
    }

    if (!["https:", "http:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, message: "Invalid review URL." },
        { status: 400 }
      );
    }

    await connectDB();

    if (await Client.exists({ email })) {
      return NextResponse.json(
        { success: false, message: "A client with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const client = await Client.create({
      email,
      passwordHash,
      businessName,
      placeId,
      googleUrl,
      expiryDate,
    });

    return NextResponse.json(
      { success: true, client: safeClient(client) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create client failed:", error.message);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "That email is already registered." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to create client." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, hasGeneratedQr, savedQrUrl } = body;

    await connectDB();

    // Clients can update only their own QR information.
    // Admins can update QR information for any client.
    const query = session.role === "admin"
      ? { _id: id }
      : { _id: session.userId };

    const update = {};

    if (typeof hasGeneratedQr === "boolean") {
      update.hasGeneratedQr = hasGeneratedQr;
    }

    if (typeof savedQrUrl === "string") {
      if (savedQrUrl.length > 5000) {
        return NextResponse.json(
          { success: false, message: "QR URL is too long." },
          { status: 400 }
        );
      }
      update.savedQrUrl = savedQrUrl;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json(
        { success: false, message: "No valid updates supplied." },
        { status: 400 }
      );
    }

    const client = await Client.findOneAndUpdate(query, update, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, client: safeClient(client) });
  } catch (error) {
    console.error("Update client failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to update client." },
      { status: 500 }
    );
  }
}