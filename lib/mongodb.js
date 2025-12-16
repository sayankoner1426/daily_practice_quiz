import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in env");
}

//global cache
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const dbConnect = async () => {
  try {
    if (cached.conn) {
      return cached.conn;
    }
    if (!cached.promise) {
      console.log("⏳ Connecting to MongoDB...");

      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;

    console.log("MongoDB Connected Successfully");

    return cached.conn;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};
export default dbConnect;