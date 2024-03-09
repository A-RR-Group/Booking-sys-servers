const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();

app.use(bodyParser.json())
dotenv.config()
app.use(cors())

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Booking-sys-servers"
    })
})

app.use("/admin", require("./routes/admin"));

const port = process.env.PORT

app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
})