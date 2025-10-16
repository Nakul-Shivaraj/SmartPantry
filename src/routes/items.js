import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";

const router = express.Router();

// GET all items (sorted for stable UI)
router.get("/", async (_req, res) => {
  try {
    const db = getDb();
    const items = await db
      .collection("items")
      .find({})
      .sort({ location: 1, name: 1 })
      .toArray();
    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST a new item — if it exists (same name + location), update quantity instead
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { name, quantity, location, notes, units } = req.body;

    if (!name || !quantity || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cleanName = name.trim();
    const cleanLocation = location.trim();
    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity must be a positive number" });
    }

    // ✅ Check if an item with same name & location exists
    const existingItem = await db
      .collection("items")
      .findOne({ name: cleanName, location: cleanLocation });

    if (existingItem) {
      // ✅ If exists, update the quantity (and optional notes)
      await db.collection("items").updateOne(
        { _id: existingItem._id },
        {
          $inc: { quantity: qty },
          ...(notes ? { $set: { notes } } : {}),
          ...(units ? { $set: { units } } : {}),
        },
      );

      const updatedItem = await db
        .collection("items")
        .findOne({ _id: existingItem._id });

      return res
        .status(200)
        .json({ message: "Item updated", item: updatedItem });
    }

    // ✅ Otherwise insert a new item
    const result = await db.collection("items").insertOne({
      name: cleanName,
      quantity: qty,
      location: cleanLocation,
      notes: notes || "",
      units: units || "",
      createdAt: new Date(),
    });

    const createdItem = await db
      .collection("items")
      .findOne({ _id: result.insertedId });

    return res.status(201).json({ message: "Item added", item: createdItem });
  } catch (error) {
    console.error("❌ Error adding/updating item:", error);
    return res.status(500).json({ error: "Failed to add item" });
  }
});

// PUT (update) an item by ID
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { quantity, notes, units } = req.body;

    await db
      .collection("items")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { quantity: Number(quantity), notes, units } },
      );

    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("❌ Error updating item:", error);
    res.status(500).send("Failed to update item");
  }
});

// DELETE an item by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    let objectId;
    try {
      objectId = new ObjectId(String(id));
    } catch {
      return res.status(400).json({ error: "Invalid item ID format" });
    }

    await db.collection("items").deleteOne({ _id: objectId });
    res.status(204).send();
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
