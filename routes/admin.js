const express = require("express");
const { welcome, register, login, getExpresses, getStations, addExpress, removeExpress, Bus_station, Remove_Bus_station, edit_Bus_station } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/getExpresses").get(getExpresses)
router.route("/getStations").get(getStations)
router.route("/addExpress").post(addExpress)
router.route("/removeExpress").post(removeExpress)
router.route("/Bus_station").post(Bus_station)
router.route("/Remove_Bus_station").post(Remove_Bus_station)
router.route("/edit_Bus_station").post(edit_Bus_station)

module.exports = router;
