const Book = require("../models/bookModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
// Create Book -> Admin
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const Book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    Book,
  });
});

// Get all Books
exports.getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 8;
  const BooksCount = await Book.countDocuments();
  const apiFeature = new ApiFeatures(Book.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const Books = await apiFeature.query;

  let filteredBooksCount = 5;

  if (!Books) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    Books,
    BooksCount,
    resultPerPage,
    filteredBooksCount,
  });
});

// Update Book
exports.updateBook = catchAsyncErrors(async (req, res, next) => {
  let Book = await Book.findById(req.params.id);

  if (!Book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  Book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    Book,
  });
});

// Delete Book
exports.deleteBook = catchAsyncErrors(async (req, res, next) => {
  const Book = await Book.findById(req.params.id);

  if (!Book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  await Book.remove();

  res.status(200).json({
    success: true,
    message: "Book deleted..",
  });
});

// Get Book details
exports.getBookDetails = catchAsyncErrors(async (req, res, next) => {
  const Book = await Book.findById(req.params.id);

  if (!Book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    Book,
  });
});

// Create Book review or update
exports.createBookReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, BookId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const Book = await Book.findById(BookId);

  const isReviewed = Book.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    Book.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    Book.reviews.push(review);
    Book.numOfReviews = Book.reviews.length;
  }

  let avg = 0;

  Book.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  Book.ratings = avg / Book.reviews.length;

  await Book.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    Book,
  });
});

// Get all reviews of the Book
exports.getBookReviews = catchAsyncErrors(async (req, res, next) => {
  const Book = await Book.findById(req.query.id);

  if (!Book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: Book.reviews,
  });
});

// Delete a review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const Book = await Book.findById(req.query.BookId);

  if (!Book) {
    return next(new ErrorHandler("Book not found!", 404));
  }

  const reviews = Book.reviews.filter(
    (rev) => rev._id.toString() != req.query.id
  );

  // update rating
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const rating = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Book.findByIdAndUpdate(
    req.query.BookId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    reviews: Book.reviews,
  });
});
