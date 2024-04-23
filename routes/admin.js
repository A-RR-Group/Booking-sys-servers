const express = require("express");
const { welcome, register, login } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)
router.route("/login").post(login)

module.exports = router;
