import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mySlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  theirSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.model("SwapRequest", swapRequestSchema);
