const express = require("express");
const { welcome, register, login, getExpresses, getStations, addExpress, removeExpress } = require("../controllers/Controller-admin");
const router = express.Router();

router.route("/").get(welcome)
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/getExpresses").get(getExpresses)
router.route("/getStations").get(getStations)
router.route("/addExpress").post(addExpress)
router.route("/removeExpress").post(removeExpress)

module.exports = router;
