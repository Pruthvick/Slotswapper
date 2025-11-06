import Event from "../models/event.js";

// ✅ Create event
export const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    const newEvent = await Event.create({
      title,
      startTime,
      endTime,
      status,
      user: req.user.id,
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
};

// ✅ Get all events for logged-in user
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
};

// ✅ Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
};

// ✅ Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
};
