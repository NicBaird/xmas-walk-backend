const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "./state.json";

// --- Helper functions ---
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- Initialize JSON file if missing ---
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    locations: [
      {
        name: "The Red Lion",
        address: "123 Main St",
        description: "Cozy pub with great ales",
        image: "https://example.com/redlion.jpg"
      },
      {
        name: "The Dog & Duck",
        address: "456 Queen St",
        description: "Classic pub fare and beers",
        image: "https://example.com/dogduck.jpg"
      }
    ],
    state: {
      current: 0,
      next: 1,
      status: "At Location",
      stopNumber: 1,
      custom: null
    }
  };
  writeData(initialData);
}

// --- Public endpoint ---
app.get("/state", (req, res) => {
  const data = readData();
  res.json(data);
});

// --- Admin update endpoint ---
app.post("/update", (req, res) => {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const {
  current,
  next,
  status,
  stopNumber,
  currentCustom,
  nextCustom
} = req.body;

  const data = readData();

  // Validate status
  const validStatus = ["In Transit", "At Location", "Leaving"];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  // Update state
    data.state.current = current !== null ? current : null;
    data.state.next = next !== null ? next : null;
    data.state.status = status;
    data.state.stopNumber = parseInt(stopNumber) || 1;

    // ✅ STORE CUSTOM FIELDS PROPERLY
    data.state.currentCustom = currentCustom || null;
    data.state.nextCustom = nextCustom || null;


  writeData(data);
  res.json({ success: true, state: data.state });
});

// --- Start server ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Xmas Walk backend running on port ${port}`);
});
