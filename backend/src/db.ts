import mongoose from "mongoose";

let connected = false;
let lastError: string | null = null;

export async function connectToMongo() {
  if (connected) return;
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    lastError = "MONGODB_URI is not set.";
    console.error("MongoDB connection failed:", lastError);
    if (process.env.NODE_ENV === "production") {
      throw new Error(lastError);
    }
    return;
  }

  console.log("Connecting to MongoDB...");
  // Prevent Mongoose from buffering forever if Mongo is down.
  mongoose.set("bufferCommands", false);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    lastError = null;
    console.log("MongoDB connected successfully.");
  } catch (e) {
    lastError = e instanceof Error ? e.message : "Mongo connection failed";
    console.error("MongoDB connection failed:", lastError);
    if (process.env.NODE_ENV === "production") {
      throw new Error(lastError);
    }
  }
}

export function isMongoConnected() {
  return connected;
}

export function getMongoLastError() {
  return lastError;
}

