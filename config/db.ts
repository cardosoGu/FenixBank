import mongoose from 'mongoose'
import throwlhos from 'throwlhos'
import { env } from "./Env.ts";

export async function DBConnection() {
  console.log("Trying to connect to MongoDB...");
  try {
    await mongoose.connect(env.DATABASE_URL, {
      dbName: "bankdata",
      authSource: "admin",
      serverSelectionTimeoutMS: 5000,
    })
    console.log("Successfully connected to MongoDB 🌍");

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw throwlhos.default.err_internalServerError(`❌ Error to connect to MongoDB |: ${message}`);
  };
}
