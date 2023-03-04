const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const {addComment, addReply} = require("../controllers/discussionController")

router.route("/add-comment").post(isAuthenticatedUser, addComment)
router.route("/add-reply").post(isAuthenticatedUser, addReply)

module.exports = router;