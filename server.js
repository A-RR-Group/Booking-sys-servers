const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();

app.use(express.json());

// Middleware
app.use(bodyParser.json());
dotenv.config();
app.use(cors());

// Routes
app.use("/admin", require("./routes/admin"))

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
