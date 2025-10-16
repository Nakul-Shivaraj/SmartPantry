# Project 1: Personal Homepage — Design Document

**Author:** Nakul Shivaraj  
**Class:** CS 5010 — MSCS, Northeastern University, Oakland  
**Date:** October 2025  

---

## 1. Project Description
SmartPantry is a full-stack web application that allows users to manage household pantry items efficiently.
The system helps track food inventory, quantities, and storage locations (e.g., fridge, shelf, pantry).

It is built using Node.js + Express on the backend, MongoDB for the database, and vanilla JavaScript (ES6 modules) for client-side rendering.
The app uses RESTful APIs to handle CRUD operations on two MongoDB collections:
- items → pantry items with name, quantity, units, notes, and location
- locations → storage categories such as Fridge, Pantry, or Shelf

Key Features:
- Add, edit, and delete items in real time.
- Add, rename, and delete storage locations.
- Pagination (10 items per card) for large inventories.
- Auto-update item quantities and units.
- Empty location cards show “No items yet.”
- Cascading delete: removing a location deletes its items.
- Fully modular folder structure (/routes, /db, /frontend/js, /frontend/css).
- Uses Bootstrap 5 for styling and responsive layout.

---

## 2. User Personas
- Persona 1 — Home Cook:
Wants to track pantry and fridge items efficiently to avoid waste.
Needs quick updates on what’s running out.

- Persona 2 — Student in Shared Apartment:
Needs to manage limited shared storage.
Uses SmartPantry to record who owns what and monitor quantities.

- Persona 3 — Busy Parent:
Wants to know what groceries need restocking before going shopping.
App must be simple, clean, and mobile-friendly.

---

## 3. User Stories
- As a home cook, I want to add items with name, quantity, units, and notes so I can track expiration or restock reminders.
- As a user, I want to rename or delete a location (like “Fridge” or “Shelf”) easily so I can reorganize my pantry.
- As a parent, I want to update item quantities (e.g., reduce milk to 0 to delete it automatically) without manually removing it.
- As a student, I want a clear overview of each storage area to see items grouped by location.
- As a user, I want to add new locations dynamically and see empty ones immediately appear in the UI.

---

## 4. Design Mockups

Homepage (index.html)

- Navbar → App title: “🥫 SmartPantry”
- Button → “➕ Add Item” (modal form)
- Cards → Each represents a location (Fridge, Pantry, Shelf)
    - Header with Edit (✏️) and Delete (🗑️) buttons
    - Table listing items: Item | Qty | Units | Notes
    - Pagination (10 items per page)
- Modal Forms:
    - Add Item → name, quantity, location, units, notes
    - Edit Item → update or delete
    - Add Location → name, type (Fridge/Shelf/Pantry)
- Responsive Layout:
    - Bootstrap grid system
    - Mobile-friendly design (cards stack vertically)

---

## 5. Database Schema
Collection 1 — items
| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| `_id`       | ObjectId | Unique ID                             |
| `name`      | String   | Item name                             |
| `quantity`  | Number   | Item quantity                         |
| `units`     | String   | Unit (kg, g, lb, etc.)                |
| `notes`     | String   | Optional notes (e.g., “expires soon”) |
| `location`  | String   | References a location name            |
| `createdAt` | Date     | Timestamp of creation                 |

Collection 2 — locations
| Field  | Type     | Description                      |
| ------ | -------- | -------------------------------- |
| `_id`  | ObjectId | Unique ID                        |
| `name` | String   | Location name                    |
| `type` | String   | Category (Fridge, Shelf, Pantry) |

---

## 6. Architecture Overview
- Frontend:
    - Pure vanilla JavaScript modules (api.js, main.js)
    - Bootstrap-based layout, modals for CRUD actions
    - Client-side rendering and pagination
- Backend:
    - Node.js + Express routes (items.js, locations.js)
    - MongoDB native driver (db/mongo.js)
    - RESTful endpoints for items and locations
- Database:
    - MongoDB Atlas cloud database
    - Two collections with cross-referenced names
    - Cascade deletion handled in routes

## 7. Future Improvements
- Expiration date tracking with alerts.
- Graphs of usage frequency.
- Barcode scanning for grocery input.
- Shopping list generation.