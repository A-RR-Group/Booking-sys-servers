const express = require("express");
const { welcome, register, login, getExpresses, getStations, addExpress, removeExpress, addBusStation, RemoveBusStation, editBusStation, verify_token } = require("../controllers/Controller-admin");
const validate_token = require("../middlewares/validate_token");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/verify_token").post(validate_token, verify_token)
router.route("/getExpresses").get(validate_token, getExpresses)
router.route("/getStations").get(validate_token, getStations)
router.route("/addExpress").post(validate_token, addExpress)
router.route("/removeExpress").post(validate_token, removeExpress)
router.route("/addBusStation").post(validate_token, addBusStation)
router.route("/RemoveBusStation").post(validate_token, RemoveBusStation)
router.route("/editBusStation").post(validate_token, editBusStation)

module.exports = router;
