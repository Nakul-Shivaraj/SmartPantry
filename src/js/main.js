/* eslint-disable no-undef */
import {
  getItems,
  addItem,
  deleteItem,
  updateItem,
  getLocations,
  addLocation,
  deleteLocation,
  updateLocation,
} from "./api.js";

// DOM elements
const addForm = document.getElementById("addItemForm");
const nameInput = document.getElementById("itemName");
const quantityInput = document.getElementById("itemQuantity");
const locationInput = document.getElementById("itemLocation");
const notesInput = document.getElementById("itemNotes");
const unitsInput = document.getElementById("itemUnits");
const locationsContainer = document.getElementById("locationsContainer");

// Subtitle helper
const subtitleFor = (loc) => {
  if (!loc) return "Pantry";
  const l = loc.toLowerCase();
  if (l.includes("fridge")) return "Fridge";
  if (l.includes("freezer")) return "Fridge";
  if (l.includes("shelf")) return "Shelf";
  if (l.includes("pantry")) return "Pantry";
  return "Pantry";
};

// ✅ Pagination setup
const PAGE_SIZE = 10;
const pageByLocation = Object.create(null);

// ✅ Modified: load both locations + items
const loadItemsAndLocations = async () => {
  try {
    const [items, locations] = await Promise.all([getItems(), getLocations()]);
    locationsContainer.innerHTML = "";

    if (items.length === 0 && locations.length === 0) {
      locationsContainer.innerHTML = `<p class="text-muted text-center">No locations or items yet — add some!</p>`;
      return;
    }

    // Group items by location
    const groupedItems = items.reduce((acc, item) => {
      const key = item.location || "Unassigned";
      (acc[key] ||= []).push(item);
      return acc;
    }, {});

    // Merge location names from both DB + items
    const allLocationNames = new Set([
      ...locations.map((l) => l.name),
      ...Object.keys(groupedItems),
    ]);

    const allLocationObjects = Array.from(allLocationNames).map((name) => {
      const existing = locations.find((l) => l.name === name);
      return (
        existing || {
          _id: null,
          name,
          type: subtitleFor(name),
        }
      );
    });

    // Render each location card
    allLocationObjects.forEach((locObj) => {
      const location = locObj.name;
      const locItems = groupedItems[location] || [];

      // Pagination logic
      if (!pageByLocation[location]) pageByLocation[location] = 1;
      const totalItems = locItems.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      const currentPage = Math.min(pageByLocation[location], totalPages);
      pageByLocation[location] = currentPage;

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageItems = locItems.slice(start, end);

      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-5 col-xl-4";

      col.innerHTML = `
        <div class="card shadow-sm h-100 position-relative">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title text-success mb-0">${location}</h5>
              <div>
                <button 
                  class="btn btn-sm btn-outline-secondary edit-loc-btn ${!locObj._id ? "unsaved-loc" : ""}"
                  data-id="${locObj._id || ""}"
                  data-name="${locObj.name}">✏️</button>
                <button 
                  class="btn btn-sm btn-outline-danger delete-loc-btn ${!locObj._id ? "unsaved-loc" : ""}"
                  data-id="${locObj._id || ""}"
                  data-name="${locObj.name}">🗑️</button>
              </div>
            </div>
            <p class="text-muted small mb-2">${subtitleFor(location)}</p>

            <div class="table-responsive">
              <table class="table table-sm mb-2">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Units</th><th>Notes</th><th></th></tr>
                </thead>
                <tbody>
                  ${
                    pageItems.length
                      ? pageItems
                          .map(
                            (i) => `
                            <tr>
                              <td>${i.name}</td>
                              <td>${i.quantity}</td>
                              <td>${i.units || "-"}</td>
                              <td>${i.notes || ""}</td>
                              <td>
                                <button 
                                  class="btn btn-sm btn-outline-success edit-btn" 
                                  data-id="${i._id}" 
                                  data-name="${i.name}" 
                                  data-qty="${i.quantity}"
                                  data-units="${i.units || ""}"
                                  data-notes="${i.notes || ""}" 
                                  data-location="${i.location}">
                                  Edit
                                </button>
                              </td>
                            </tr>`,
                          )
                          .join("")
                      : `<tr><td colspan="5" class="text-muted text-center">No items here</td></tr>`
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination buttons -->
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                ${
                  totalItems === 0
                    ? "No items"
                    : `Showing ${start + 1}-${Math.min(
                        end,
                        totalItems,
                      )} of ${totalItems}`
                }
              </small>
              <div class="btn-group btn-group-sm" role="group" aria-label="Pagination">
                <button 
                  class="btn btn-outline-secondary page-btn" 
                  data-loc="${location}" 
                  data-dir="-1" 
                  ${currentPage <= 1 ? "disabled" : ""}>
                  ‹ Prev
                </button>
                <button class="btn btn-light" disabled>
                  Page ${currentPage} / ${totalPages}
                </button>
                <button 
                  class="btn btn-outline-secondary page-btn" 
                  data-loc="${location}" 
                  data-dir="1" 
                  ${currentPage >= totalPages ? "disabled" : ""}>
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>`;
      locationsContainer.appendChild(col);
    });
  } catch (error) {
    console.error("Error loading items/locations:", error);
  }
};

// ✅ Pagination click listener
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn) return;

  const loc = btn.dataset.loc;
  const dir = Number(btn.dataset.dir || 0);
  if (!loc || !dir) return;

  const current = pageByLocation[loc] || 1;
  pageByLocation[loc] = Math.max(1, current + dir);
  loadItemsAndLocations();
});

// Add new item
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newItem = {
    name: nameInput.value.trim(),
    quantity: Number.parseInt(quantityInput.value, 10),
    location: locationInput.value.trim(),
    notes: notesInput.value.trim() || undefined,
    units: unitsInput.value.trim() || undefined,
  };

  if (!newItem.name || Number.isNaN(newItem.quantity) || !newItem.location) {
    alert("Please fill out name, quantity, units, and location.");
    return;
  }

  try {
    await addItem(newItem);
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addItemModal"),
    );
    if (addModal) addModal.hide();
    addForm.reset();
    await loadItemsAndLocations();
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item.");
  }
});

// Edit item
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const btn = e.target;
    document.getElementById("editItemId").value = btn.dataset.id;
    document.getElementById("editItemName").value = btn.dataset.name;
    document.getElementById("editItemQuantity").value = btn.dataset.qty;
    document.getElementById("editItemUnits").value = btn.dataset.units || "";
    document.getElementById("editItemNotes").value = btn.dataset.notes || "";

    const editModal = new bootstrap.Modal(
      document.getElementById("editItemModal"),
    );
    editModal.show();
  }
});

// Update item
document
  .getElementById("editItemForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editItemId").value;
    const quantity = Number(document.getElementById("editItemQuantity").value);
    const notes = document.getElementById("editItemNotes").value.trim();
    const units = document.getElementById("editItemUnits").value.trim();

    if (quantity < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    try {
      await updateItem(id, { quantity, notes, units });
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editItemModal"),
      );
      modal.hide();
      await loadItemsAndLocations();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item");
    }
  });

// Delete item
document.getElementById("deleteItemBtn").addEventListener("click", async () => {
  const id = document.getElementById("editItemId").value;
  if (!id) return alert("No item selected.");
  if (!confirm("Delete this item?")) return;

  try {
    await deleteItem(id);
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editItemModal"),
    );
    modal.hide();
    await loadItemsAndLocations();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete item");
  }
});

// Add Location
document
  .getElementById("addLocationForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("locationName").value.trim();
    const type = document.getElementById("locationType").value.trim();

    if (!name || !type) {
      alert("Please fill out location name and type.");
      return;
    }

    try {
      const { location } = await addLocation({ name, type });

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addLocationModal"),
      );
      modal.hide();
      e.target.reset();

      // Add new empty card instantly
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-5 col-xl-4";
      col.innerHTML = `
      <div class="card shadow-sm h-100 position-relative">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title text-success mb-0">${location.name}</h5>
            <div>
              <button class="btn btn-sm btn-outline-secondary edit-loc-btn" data-id="${location._id}" data-name="${location.name}">✏️</button>
              <button class="btn btn-sm btn-outline-danger delete-loc-btn" data-id="${location._id}" data-name="${location.name}">🗑️</button>
            </div>
          </div>
          <p class="text-muted small mb-2">${location.type}</p>
          <p class="text-muted small mb-0 text-center">No items here yet</p>
        </div>
      </div>`;
      locationsContainer.appendChild(col);
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Failed to add location.");
    }
  });

// Edit Location Handler
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".edit-loc-btn");
  if (!btn) return;

  const locId = btn.dataset.id;
  const locName = btn.dataset.name;

  // Normal edit flow
  const newName = prompt(`Rename location "${locName}" to:`, locName);
  if (!newName || newName.trim() === "" || newName === locName) return;

  try {
    await updateLocation(locId, { name: newName.trim() });
    alert(`Location renamed to "${newName}"`);
    await loadItemsAndLocations();
  } catch (err) {
    console.error("Error updating location:", err);
    alert("Failed to update location name.");
  }
});

//  Delete Location
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-loc-btn");
  if (!btn) return;

  const locId = btn.dataset.id;
  const locName = btn.dataset.name;

  if (!locId) {
    try {
      await addLocation({ name: locName, type: subtitleFor(locName) });
      alert(`Location "${locName}" saved successfully.`);
      await loadItemsAndLocations();
    } catch (err) {
      console.error("Error saving location:", err);
      alert("Failed to save location.");
    }
    return;
  }

  try {
    const items = await getItems();
    const hasItems = items.some((item) => item.location === locName);

    if (hasItems) {
      if (
        !confirm(
          `⚠️ WARNING: "${locName}" contains items.\nDeleting it will remove ALL its items.\nContinue?`,
        )
      )
        return;
    } else {
      if (!confirm(`Delete empty location "${locName}"?`)) return;
    }

    await deleteLocation(locId);
    alert(`Location "${locName}" deleted successfully.`);
    await loadItemsAndLocations();
  } catch (err) {
    console.error("Error deleting location:", err);
    alert("Failed to delete location. Please try again.");
  }
});

// Initial load
loadItemsAndLocations();
