const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();

app.use(bodyParser.json())
dotenv.config()
app.use(cors())

app.use("/admin", require("./routes/admin"));

const port = process.env.PORT
app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
})