const { Book, BookInteraction } = require("../models/bookModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const moment = require('moment');
const _ = require('lodash');
// Create Book -> Admin
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  req.body.user = {
    user_id: req.user.id,
    name: req.user.name,
    ...(req.user.avatar && { profileImage: req.user.avatar.url })
  };

  const book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    book
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

  book.rating = avg / book.reviews.length;

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


// Book Interaction APIs
exports.bookInteraction = catchAsyncErrors(async (req, res) => {
  const { user_id, book_id, rating, is_read, is_reviewed, genre } = req.body;

  console.log(req.body)

  // Find the existing book interaction or create a new one
  let bookInteraction = await BookInteraction.findOne({ user_id, book_id });
  if (!bookInteraction) {
    bookInteraction = new BookInteraction({ user_id, book_id });
  }

  // Update the fields
  if (is_reviewed) {
    bookInteraction.rating = rating;
    bookInteraction.is_reviewed = true;
  } if (is_read) {
    bookInteraction.is_read = true;
  }
  if (rating) {
    bookInteraction.rating = rating;
  }
  if (genre) {
    bookInteraction.genre = genre;
  }

  // Save the updated book interaction
  await bookInteraction.save();

  res.status(200).json({
    success: true,
    bookInteraction,
  });

});

// Get all interactions
exports.getInteractions = catchAsyncErrors(async (req, res, next) => {
  const interactions = await BookInteraction.find();
  res.status(200).json({
    success: true,
    interactions,
  });
})

// Get pupular
exports.getPopularBooks = catchAsyncErrors(async (req, res, next) => {
  const { genre } = req.body;

  // const popularity_score = await BookInteraction.aggregate([
  //   {
  //     $group: {
  //       _id: "$book_id",
  //       is_read: { $sum: "$is_read" },
  //       rating: { $avg: "$rating" },
  //       likedPercent: { $avg: "$likedPercent" },
  //       numRatings: { $avg: "$numRatings" },
  //       // ...({ genre: { $first: "$genre" } })

  //     }
  //   },
  //   {
  //     $match: {
  //       is_read: { $ne: 0 },
  //       // ...({ genre: { $eq: genre } })
  //     }
  //   },
  //   {
  //     $sort: {
  //       popularity: -1
  //     }
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       book_id: "$_id",
  //       popularity: {
  //         $sum: [
  //           { $cond: { if: { $ne: ["$is_read", 0] }, then: { $divide: ["$is_read", { $sum: "$is_read" }] }, else: 0 } },
  //           "$rating",
  //           "$likedPercent",
  //           "$numRatings"
  //         ]
  //       }
  //     }
  //   },
  //   {
  //     $sort: {
  //       popularity: -1
  //     }
  //   },
  //   {
  //     $limit: 10
  //   }
  // ]);

  // console.log(popularity_score)

  // const popular_books = await Book.find({ book_id: { $in: popularity_score.map(score => score.book_id) } }).sort({ popularity: -1 });

  const matchStage = {
    $match: {
      $and: [
        { numRatings: { $ne: null } },
        { readCount: { $ne: null } },
        { likedPercent: { $ne: null } },
      ]
    }
  };

  if (genre) {
    matchStage.$match.$and.push({ genres: { $in: [genre] } });
  }

  console.log("matchStage", genre)
  console.log("req.body", req.body)

  const popular_books = await Book.aggregate([
    matchStage,
    {
      $addFields: {
        popularityScore: {
          $sum: [
            {
              $cond: [
                {
                  $eq: ["$numRatings", 0]
                },
                0,
                {
                  $multiply: [
                    0.4,
                    {
                      $divide: ["$numRatings", { $add: ["$numRatings", "$numOfReviews"] }]
                    }
                  ]
                }
              ]
            },
            {
              $multiply: [0.2, "$likedPercent"]
            },
            {
              $cond: [
                {
                  $eq: ["$readCount", 0]
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$readCount", { $add: ["$readCount", "$numOfReviews"] }]
                    }
                  ]
                }
              ]
            },
            {
              $cond: [
                {
                  $eq: ["$numOfReviews", 0]
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$numOfReviews", { $add: ["$numRatings", "$numOfReviews"] }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    {
      $sort: { popularityScore: -1 }
    },
    {
      $limit: 50
    }
  ])

  // console.log(popular_books)


  res.status(200).json({
    success: true,
    total: popular_books.length,
    popular_books,
  });
})

exports.getTrendingBooks = catchAsyncErrors(async (req, res, next) => {
  const { genre } = req.body;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const matchStage = {
    $match: {
      $and: [
        { numRatings: { $ne: null } },
        { readCount: { $ne: null } },
        { likedPercent: { $ne: null } },
        { createdAt: { $gte: weekAgo } }
      ]
    }
  };

  if (genre) {
    matchStage.$match.$and.push({ genres: { $in: [genre] } });
  }
  const trendingBooks = await Book.aggregate([
    matchStage,
    {
      $project: {
        book_id: 1,
        title: 1,
        rating: 1,
        genres: 1,
        numRatings: 1,
        readCount: 1,
        likedPercent: 1,
        numOfReviews: 1,
        reviews: 1,
        createdAt: 1,
        trendingScore: {
          //   $add: [
          //     { $multiply: ['$likedPercent', 0.4] },
          //     { $multiply: ['$numOfReviews', 0.3] },
          //     { $multiply: ['$readCount', 0.2] },
          //     { $multiply: ['$rating', 0.1] },
          //   ],
          $multiply: [
            { $cond: [{ $ne: ["$rating", 0] }, { $toDouble: "$rating" }, 1] },
            { $cond: [{ $ne: ["$numOfReviews", 0] }, { $divide: ["$numOfReviews", "$readCount"] }, 1] },
            { $cond: [{ $ne: ["$likedPercent", 0] }, { $divide: ["$likedPercent", 100] }, 1] }
          ]
        },
      },
    },
    {
      $sort: { createdAt: -1, trendingScore: -1 },
    },
    {
      $limit: 10,
    },
  ]);
  res.status(200).json({
    success: true,
    total: trendingBooks.length,
    trendingBooks,
  });
})