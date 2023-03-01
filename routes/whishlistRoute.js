const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
    addWhishlist, removeBook, getWhishlist, clearWishlist
} = require("../controllers/whishlistController");

router.route("/whishlist/add").post(isAuthenticatedUser, addWhishlist)
router.route("/whishlist/remove").patch(isAuthenticatedUser, removeBook)
router.route("/whishlist").get(isAuthenticatedUser, getWhishlist)
router.route("/whishlist/clear").delete(isAuthenticatedUser, clearWishlist)

module.exports = router;