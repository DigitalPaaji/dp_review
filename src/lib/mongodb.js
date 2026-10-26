// async function connectDB() {
//   console.log("🔄 Checking MongoDB connection...");
//   console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);

//   try {
//     const connection = await mongoose.connect(
//       process.env.MONGODB_URI,
//       { serverSelectionTimeoutMS: 5000 }
//     );

//     console.log("✅ MongoDB Connected!");
//     console.log("📦 Database:", connection.connection.name);
//     console.log("🌐 Host:", connection.connection.host);

//     return connection;
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:", error.message);
//     throw error;
//   }
// }



import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
 
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = {
    conn: null,
    promise: null,
  };
}  

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        console.log("Database:", mongooseInstance.connection.name);
        console.log("Host:", mongooseInstance.connection.host);

        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;