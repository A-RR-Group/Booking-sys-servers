const express = require("express");
const { welcome, login, addBus, editBus, getBuses, addRide } = require("../controllers/controller-express");
const router = express.Router();

router.route("/").get(welcome)
router.route("/login").post(login)
router.route("/addBus").post(addBus)
router.route("/editBus").post(editBus)
router.route("/getBuses").get(getBuses)
router.route("/addRide").post(addRide)

module.exports = router;

