const API_BASE = "/api";

const checkResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  if (res.status === 204) return true;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return true;
  return res.json();
};

// 🧺 Items API
export const getItems = async () =>
  checkResponse(await fetch(`${API_BASE}/items`));

export const addItem = async (item) =>
  checkResponse(
    await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }),
  );

export const updateItem = async (id, data) =>
  checkResponse(
    await fetch(`${API_BASE}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );

export const deleteItem = async (id) =>
  checkResponse(await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" }));

// 📍 Locations API
// fetch all locations
export const getLocations = async () =>
  checkResponse(await fetch(`${API_BASE}/locations`));

// add a new location
export const addLocation = async (location) =>
  checkResponse(
    await fetch(`${API_BASE}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    }),
  );

// update existing location
export const updateLocation = async (id, data) =>
  checkResponse(
    await fetch(`${API_BASE}/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );

// delete location
export const deleteLocation = async (id) =>
  checkResponse(
    await fetch(`${API_BASE}/locations/${id}`, { method: "DELETE" }),
  );
