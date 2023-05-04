const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const {addComment, addReply, getComments} = require("../controllers/discussionController")

router.route("/add-comment").post(isAuthenticatedUser, addComment)
router.route("/add-reply").post(isAuthenticatedUser, addReply)
router.route("/comments/:bookId").get(isAuthenticatedUser, getComments)

module.exports = router;