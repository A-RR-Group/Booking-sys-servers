const express = require("express");
const { welcome, login, addBus, editBus, getBuses, addRide, getRides, RemoveBus } = require("../controllers/controller-express");
const router = express.Router();

router.route("/").get(welcome)
router.route("/login").post(login)
router.route("/addBus").post(addBus)
router.route("/editBus").post(editBus)
router.route("/getBuses").get(getBuses)
router.route("/addRide").post(addRide)
router.route("/getRides").get(getRides)
router.route("/RemoveBus").post(RemoveBus)

module.exports = router;

