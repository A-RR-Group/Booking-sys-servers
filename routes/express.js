const express = require("express");
const { welcome, login, addBus } = require("../controllers/controller-express");
const router = express.Router();

router.route("/").get(welcome)
router.route("/login").post(login)
router.route("/addBus").post(addBus)

module.exports = router;

