const Book = require("../models/bookModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
// Create Book -> Admin
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const book = await Book.create(req.body);

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
    // .search()
    // .filter()
    // .pagination();

  const books = await apiFeature.query;

  let filteredBooksCount = 5;

  if (!books) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    books,
    BooksCount,
    resultPerPage,
    filteredBooksCount,
  });
});

// Update Book
exports.updateBook = catchAsyncErrors(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    book,
  });
});

// Delete Book
exports.deleteBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  await book.remove();

  res.status(200).json({
    success: true,
    message: "Book deleted..",
  });
});

// Get Book details
exports.getBookDetails = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    book,
  });
});

// Create Book review or update
exports.createBookReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, bookId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const book = await Book.findById(bookId);

  const isReviewed = book.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  console.log("inside 107")
  if (isReviewed) {
    book.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    book.reviews.push(review);
    book.numOfReviews = book.reviews.length;
  }

  let avg = 0;

  book.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  book.ratings = avg / book.reviews.length;

  await book.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    book,
  });
});

// Get all reviews of the Book
exports.getBookReviews = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.query.id);

  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: book.reviews,
  });
});

// Delete a review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.query.BookId);

  if (!book) {
    return next(new ErrorHandler("Book not found!", 404));
  }

  const reviews = book.reviews.filter(
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
    reviews: book.reviews,
  });
});
