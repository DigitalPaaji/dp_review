import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true });
    await revokeSession(req, response);
    return response;
  } catch (error) {
    console.error("Logout failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to log out." },
      { status: 500 }
    );
  }
}