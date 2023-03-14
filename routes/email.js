const express = require("express");
const router = express.Router();
const {checkEmail} = require("../controllers/email")
router.route("/email-check").post(checkEmail);

module.exports = router;
