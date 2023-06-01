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
  bookInteraction,
  getInteractions,
  getPopularBooks,
  getTrendingBooks,
  getPopularBooksByGenre,
  getUploadedBooks,
  uploadFile,
  getFavouriteGenreBooks,
  getTextFromPdf,
  approveBook,
} = require("../controllers/bookController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/books").get(getAllBooks);
router.route("/admin/book/new").post(isAuthenticatedUser, createBook);

  router
  .route("/admin/book/upload")
  .post(isAuthenticatedUser, uploadFile);
router
  .route("/admin/book/:id")
  .put(isAuthenticatedUser, updateBook);

  router
  .route("/admin/approve/book/:id")
  .put(approveBook);
// router
//   .route("/admin/book/:id")
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBook);
router.route("/admin/book/new").post(isAuthenticatedUser, createBook);
router.route("/admin/book/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateBook);
router.route("/admin/book/:id").delete(deleteBook);
router.route("/book/:id").get(getBookDetails);
router.route("/review").put(isAuthenticatedUser, createBookReview);
router.route("/reviews").get(getBookReviews).delete(isAuthenticatedUser, deleteReview);

router.route("/book-interactions").put(isAuthenticatedUser, bookInteraction).get(isAuthenticatedUser, getInteractions);
router.route("/popular-books").get(isAuthenticatedUser, getPopularBooks);
router.route("/popular-books/:genre").get(isAuthenticatedUser, getPopularBooksByGenre);
router.route("/get-recommendations").get(isAuthenticatedUser, getFavouriteGenreBooks);
router.route("/trending-books").get(isAuthenticatedUser, getTrendingBooks);
router.route("/uploaded-books").get(isAuthenticatedUser, getUploadedBooks);
router.route("/pdf-text").post(getTextFromPdf);

module.exports = router;
