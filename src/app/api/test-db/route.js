
import mongoose from "mongoose";

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env.local");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    return Response.json({
      success: true,
      message: `MongoDB connected successfully ,${uri}`,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    console.error("MongoDB test failed:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
