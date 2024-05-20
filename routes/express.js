const express = require("express");
const { welcome, login } = require("../controllers/controller-express");
const router = express.Router();

router.route("/").get(welcome)
router.route("/login").post(login)

module.exports = router;

