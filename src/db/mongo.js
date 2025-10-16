import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env (default path = project root)
dotenv.config();

let db;

export const connectToDatabase = async () => {
  const url = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB;

  if (!url) {
    console.error("❌ MONGO_URL is missing in your .env file");
    process.exit(1);
  }

  try {
    const client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ Connected to MongoDB successfully (db: ${dbName})`);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error(
      "Database not initialized. Call connectToDatabase() first.",
    );
  }
  return db;
};
