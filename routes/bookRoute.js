const express = require("express");
const {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookDetails,
  createBookReview,
  getBookReviews,
  deleteReview,
} = require("../controllers/bookController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/books").get(getAllBooks);
router
  .route("/admin/book/new")
  .post(isAuthenticatedUser, createBook);
router
  .route("/admin/book/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateBook);
router
  .route("/admin/book/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBook);
router.route("/book/:id").get(getBookDetails);
router.route("/review").put(isAuthenticatedUser, createBookReview);
router
  .route("/reviews")
  .get(getBookReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
