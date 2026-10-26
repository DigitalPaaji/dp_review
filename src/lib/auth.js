import { randomBytes, createHash } from "node:crypto";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export const COOKIE_NAME = "dp_session";
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(userId, role, response) {
  await connectDB();

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await Session.create({
    tokenHash: hashToken(token),
    userId,
    role,
    expiresAt,
  });
 
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(req) {
  await connectDB();

  const cookieHeader = req.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
       
  if (!cookie) return null;

  const token = cookie.slice(COOKIE_NAME.length + 1);

  if (!token) return null;

  const session = await Session.findOne({
    tokenHash: hashToken(decodeURIComponent(token)),
    expiresAt: { $gt: new Date() },
  }).lean();
 
  if (!session) return null;

  return {
    userId: String(session.userId),
    role: session.role,
    sessionId: String(session._id),
  };
}

export async function revokeSession(req, response) {
  const auth = await getSession(req);

  if (auth) {
    await Session.findByIdAndDelete(auth.sessionId);
  }

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}