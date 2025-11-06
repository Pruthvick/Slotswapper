import express from "express";
import {
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes for event management
router.post("/", protect, createEvent);     // Create new event
router.get("/", protect, getMyEvents);      // Get all user's events
router.put("/:id", protect, updateEvent);   // Update specific event
router.delete("/:id", protect, deleteEvent); // Delete event

export default router;
