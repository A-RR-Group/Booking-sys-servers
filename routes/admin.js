const express = require("express");
const { welcome, register, login, getExpresses, getStations, addExpress, removeExpress, addBusStation, RemoveBusStation, editBusStation, verify_token } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/verify_token").post(verify_token)
router.route("/getExpresses").get(getExpresses)
router.route("/getStations").get(getStations)
router.route("/addExpress").post(addExpress)
router.route("/removeExpress").post(removeExpress)
router.route("/addBusStation").post(addBusStation)
router.route("/RemoveBusStation").post(RemoveBusStation)
router.route("/editBusStation").post(editBusStation)

module.exports = router;
