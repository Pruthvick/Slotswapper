# 🎯 SlotSwapper Backend

This is the backend server for the SlotSwapper application.  
A RESTful API built using **Node.js**, **Express**, **MongoDB**, and **JWT Authentication** for managing events and user scheduling.

## 🚀 Features
- User signup/login with JWT authentication
- CRUD operations for events
- Protected routes using middleware
- MongoDB for data persistence

## 🧩 Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing

## ⚙️ Setup
```bash
npm install
node server.js
```
## Project Specifications

### 1. User Authentication

Users must be able to Sign Up (e.g., Name, Email, Password) and Log In.
Implement JWT (JSON Web Tokens) for managing authenticated sessions. The token should be sent (e.g., as a Bearer token) with all protected API requests.

### 2. Backend: Calendar & Data Model

Design a database schema to support the application. You'll likely need tables/collections for Users, Events (or Slots), and SwapRequests.
An Event record should have at least:
title
startTime (timestamp)
endTime (timestamp)
status (e.g., an enum: BUSY, SWAPPABLE, SWAP_PENDING)
A link to its owner (e.g., userId).
Create CRUD API endpoints for a user to manage their own events.

### 3. Backend: The Swap Logic

This is the most critical part of the backend.
GET /api/swappable-slots
This endpoint must return all slots from other users that are marked as SWAPPABLE.
It should not include the logged-in user's own slots.
POST /api/swap-request
This endpoint should accept the ID of the user's slot (mySlotId) and the ID of the desired slot (theirSlotId).
Server-side logic: You must verify that both slots exist and are currently SWAPPABLE.
Create a new SwapRequest record (e.g., with a PENDING status), linking the two slots and users.
Update the status of both original slots to SWAP_PENDING to prevent them from being offered in other swaps.
POST /api/swap-response
This endpoint allows a user to respond to an incoming swap request (e.g., /api/swap-response/:requestId).
The request body should indicate acceptance (true/false).
If Rejected: The SwapRequest status is set to REJECTED, and the two slots involved must be set back to SWAPPABLE.
If Accepted: This is the key transaction. The SwapRequest is marked ACCEPTED. The owner (or userId) of the two slots must be exchanged. Both slots' status should be set back to BUSY.
