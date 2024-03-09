const express = require("express");
const { welcome } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)

module.exports = router;