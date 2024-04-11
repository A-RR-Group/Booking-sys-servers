const express = require("express");
const { welcome, register } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)

module.exports = router;
