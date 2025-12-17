const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "./state.json";

// Read state
function readState() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Write state
function writeState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

// Create default state if missing
if (!fs.existsSync(DATA_FILE)) {
  writeState({
    current: "Not started",
    next: "",
    mode: "waiting"
  });
}

// Public endpoint
app.get("/status", (req, res) => {
  res.json(readState());
});

// Admin update endpoint
app.post("/update", (req, res) => {
  const key = req.query.key;

  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { current, next, mode } = req.body;
  writeState({ current, next, mode });
  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Xmas Walk backend running on port", port);
});
