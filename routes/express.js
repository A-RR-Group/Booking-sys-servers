const express = require("express");
const { welcome, login, addBus, editBus, getBuses } = require("../controllers/controller-express");
const router = express.Router();

router.route("/").get(welcome)
router.route("/login").post(login)
router.route("/addBus").post(addBus)
router.route("/editBus").post(editBus)
router.route("/getBuses").get(getBuses)

module.exports = router;

