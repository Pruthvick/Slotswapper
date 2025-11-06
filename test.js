import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Server base route working!");
});

app.post("/test", (req, res) => {
  res.json({ message: "✅ POST /test works!", body: req.body });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Test server running on port ${PORT}`));
