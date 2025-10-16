import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";

const router = express.Router();

// GET all locations
router.get("/", async (_req, res) => {
  try {
    const db = getDb();
    const locations = await db.collection("locations").find().toArray();
    res.json(locations);
  } catch (error) {
    console.error("❌ Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// POST a new location
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const newLocation = req.body;
    const validTypes = ["Fridge", "Shelf", "Pantry", "Storage"];

    const name = newLocation.name?.trim();
    const type = newLocation.type?.trim();

    if (!name || !type || !validTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid required fields" });
    }

    const result = await db.collection("locations").insertOne({ name, type });
    const createdLocation = await db
      .collection("locations")
      .findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Location added successfully",
      location: createdLocation,
    });
  } catch (error) {
    console.error("❌ Error adding location:", error);
    res.status(500).json({ error: "Failed to add location" });
  }
});

// PUT (update) a location by ID
router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updateData = req.body;

    let objectId;
    try {
      objectId = new ObjectId(String(id));
    } catch {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    // ✅ Get existing location BEFORE updating
    const existing = await db
      .collection("locations")
      .findOne({ _id: objectId });
    if (!existing) {
      return res.status(404).json({ error: "Location not found" });
    }

    // ✅ Validate location type
    if (
      updateData.type &&
      !["Fridge", "Shelf", "Pantry"].includes(updateData.type)
    ) {
      return res.status(400).json({ error: "Invalid location type" });
    }

    // ✅ Update the location itself
    await db
      .collection("locations")
      .updateOne({ _id: objectId }, { $set: updateData });

    // ✅ Cascade rename in items if name changed
    if (updateData.name && updateData.name !== existing.name) {
      await db
        .collection("items")
        .updateMany(
          { location: existing.name },
          { $set: { location: updateData.name } },
        );
    }

    res.json({
      message: "Location updated successfully",
      location: await db.collection("locations").findOne({ _id: objectId }),
    });
  } catch (error) {
    console.error("❌ Error updating location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// DELETE a location by ID (cascade delete its items)
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    let objectId;
    try {
      objectId = new ObjectId(String(id));
    } catch {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const location = await db
      .collection("locations")
      .findOne({ _id: objectId });
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    await db.collection("locations").deleteOne({ _id: objectId });

    const deleteItemsResult = await db
      .collection("items")
      .deleteMany({ location: location.name });

    if (deleteItemsResult.deletedCount > 0) {
      res.json({
        message: `Location '${location.name}' and ${deleteItemsResult.deletedCount} item(s) deleted.`,
      });
    } else {
      res.json({
        message: `Location '${location.name}' deleted (no items were associated).`,
      });
    }
  } catch (error) {
    console.error("❌ Error deleting location:", error);
    res.status(500).json({ error: "Failed to delete location" });
  }
});

export default router;
