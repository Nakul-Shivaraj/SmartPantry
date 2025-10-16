import express from "express";
import itemsRouter from "./routes/items.js";
import locationsRouter from "./routes/locations.js";
import { connectToDatabase } from "./db/mongo.js";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🚀 Initializing SmartPantry backend...");

// Middleware to parse JSON data
app.use(express.json());

// ✅ Serve frontend files from the actual folders
app.use(express.static("src/frontend")); // serves HTML + CSS
app.use("/js", express.static("src/js")); // serves JS modules

// Register routes
app.use("/api/items", itemsRouter);
app.use("/api/locations", locationsRouter);

// ✅ Connect to MongoDB first, then start server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ SmartPantry server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
