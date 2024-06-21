const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const app = express();

app.use(express.json());
app.use(cookieParser());

// Middleware
app.use(bodyParser.json());
dotenv.config();
// app.use(cors());
app.use(cors({
  // origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true
}));

// Routes
app.use("/admin", require("./routes/admin"))
app.use("/express", require("./routes/express"))

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
