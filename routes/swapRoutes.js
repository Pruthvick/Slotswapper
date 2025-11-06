import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import Event from "../models/event.js";
import SwapRequest from "../models/swapRequest.js";

const router = express.Router();

// GET /api/swaps/swappable-slots
router.get("/swappable-slots", protect, async (req, res) => {
  try {
    const slots = await Event.find({
      user: { $ne: req.user._id },
      status: "SWAPPABLE",
    }).populate("user", "name email");
    res.json(slots);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching slots", error: err.message });
  }
});

// POST /api/swaps/swap-request
router.post("/swap-request", protect, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId)
    return res.status(400).json({ message: "Provide both IDs" });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);
    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Slot not found" });
    }

    if (mySlot.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "You don't own the offered slot" });
    }

    if (theirSlot.user.toString() === req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot request your own slot" });
    }

    if (
      mySlot.status !== "SWAPPABLE" ||
      theirSlot.status !== "SWAPPABLE"
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Slots must be SWAPPABLE" });
    }

    const created = await SwapRequest.create(
      [
        {
          requesterId: req.user._id,
          receiverId: theirSlot.user,
          mySlotId,
          theirSlotId,
          status: "PENDING",
        },
      ],
      { session }
    );

    await Event.findByIdAndUpdate(
      mySlotId,
      { status: "SWAP_PENDING" },
      { session }
    );
    await Event.findByIdAndUpdate(
      theirSlotId,
      { status: "SWAP_PENDING" },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(created[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Error creating swap request", error: err.message });
  }
});

// POST /api/swaps/swap-response/:id  { accept: true/false }
router.post("/swap-response/:id", protect, async (req, res) => {
  const { accept } = req.body;
  const requestId = req.params.id;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const swapReq = await SwapRequest.findById(requestId).session(session);
    if (!swapReq) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Request not found" });
    }

    if (swapReq.receiverId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not authorized" });
    }
    if (swapReq.status !== "PENDING") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Request not pending" });
    }

    const mySlot = await Event.findById(swapReq.mySlotId).session(session);
    const theirSlot = await Event.findById(swapReq.theirSlotId).session(session);

    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ message: "One or both slots not found" });
    }

    if (!accept) {
      swapReq.status = "REJECTED";
      await swapReq.save({ session });
      await Event.findByIdAndUpdate(
        mySlot._id,
        { status: "SWAPPABLE" },
        { session }
      );
      await Event.findByIdAndUpdate(
        theirSlot._id,
        { status: "SWAPPABLE" },
        { session }
      );
      await session.commitTransaction();
      session.endSession();
      return res.json({ message: "Rejected" });
    }

    // accept: swap owners
    const requesterId = swapReq.requesterId;
    const receiverId = swapReq.receiverId;

    await Event.findByIdAndUpdate(
      mySlot._id,
      { user: receiverId, status: "BUSY" },
      { session }
    );
    await Event.findByIdAndUpdate(
      theirSlot._id,
      { user: requesterId, status: "BUSY" },
      { session }
    );

    swapReq.status = "ACCEPTED";
    await swapReq.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Accepted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Error responding", error: err.message });
  }
});

// GET incoming/outgoing
router.get("/incoming", protect, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({
      receiverId: req.user._id,
    }).populate("requesterId mySlotId theirSlotId");
    res.json(incoming);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

router.get("/outgoing", protect, async (req, res) => {
  try {
    const outgoing = await SwapRequest.find({
      requesterId: req.user._id,
    }).populate("receiverId mySlotId theirSlotId");
    res.json(outgoing);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

export default router;
