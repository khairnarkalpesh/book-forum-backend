const express = require("express");
const router = express.Router();

const {popularBooks} = require("../controllers/recommendation");

router.route("/popular-books").get(popularBooks)

module.exports = router