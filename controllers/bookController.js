const { Book, BookInteraction } = require("../models/bookModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const { default: axios } = require("axios");
const cloudinary = require("cloudinary").v2;
// Create Book -> Admin
exports.createBook = catchAsyncErrors(async (req, res, next) => {
  req.body.user = {
    user_id: req.user.id,
    name: req.user.name,
    ...(req.user.avatar && { profileImage: req.user.avatar.url }),
  };

  console.log("req.body", req.body);
  // const filePath = req.files.pdf;
  // console.log("pdf", filePath)

  // const myCloud = await cloudinary.uploader.upload(filePath.tempFilePath, {
  //   resource_type: 'raw',
  //   folder: 'books',
  //   public_id: filePath.name
  // });

  // req.body.pdfUrl = myCloud.url

  // const myCloud = await cloudinary.uploader.upload(req.files.name, {
  //   // folder: "avatars",
  //   // width: 150,
  //   // crop: "scale",
  // });

  const book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    book,
  });
});

exports.uploadFile = catchAsyncErrors(async (req, res, next) => {
  console.log("req.body", req.files);
  const filePath = req.files.pdf;
  const imgPath = req.files.coverImage;
  // console.log("pdf", filePath)
  // console.log("pdf", filePath)

  const myPdf = await cloudinary.uploader.upload(filePath.tempFilePath, {
    resource_type: "raw",
    folder: "books",
    public_id: filePath.name,
  });

  let pdfUrl = myPdf.url;

  const myIMG = await cloudinary.uploader.upload(imgPath.tempFilePath, {
    resource_type: "raw",
    folder: "coverImages",
    public_id: imgPath.name,
    // width: 150,
    // crop: "scale",
  });

  let imgUrl = myIMG.url;

  res.status(200).json({
    success: true,
    imgUrl: imgUrl,
    pdfUrl: pdfUrl,
  });
});

// Get all Books
exports.getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 8;
  const BooksCount = await Book.countDocuments();
  const apiFeature = new ApiFeatures(Book.find(), req.query);
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

// Update Book status
exports.approveBook = catchAsyncErrors(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  book = await Book.findByIdAndUpdate(req.params.id, {
    status: "Approved"
  }, {
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

  const isReviewed = book.reviews.find((rev) => rev.user.toString() === req.user._id.toString());
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

  const reviews = book.reviews.filter((rev) => rev._id.toString() != req.query.id);

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

  console.log(req.body);

  // Find the existing book interaction or create a new one
  let bookInteraction = await BookInteraction.findOne({ user_id, book_id });
  if (!bookInteraction) {
    bookInteraction = new BookInteraction({ user_id, book_id });
  }

  // Update the fields
  if (is_reviewed) {
    bookInteraction.rating = rating;
    bookInteraction.is_reviewed = true;
  }
  if (is_read) {
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
});

// Get pupular
exports.getPopularBooks = catchAsyncErrors(async (req, res, next) => {
  const matchStage = {
    $match: {
      $and: [{ numRatings: { $ne: null } }, { readCount: { $ne: null } }, { likedPercent: { $ne: null } }],
    },
  };

  // if (genre) {
  //   matchStage.$match.$and.push({ genres: { $in: [genre] } });
  // }

  // console.log("matchStage", genre)
  // console.log("req.header", req.header)

  const popular_books = await Book.aggregate([
    matchStage,
    {
      $addFields: {
        popularityScore: {
          $sum: [
            {
              $cond: [
                {
                  $eq: ["$numRatings", 0],
                },
                0,
                {
                  $multiply: [
                    0.4,
                    {
                      $divide: ["$numRatings", { $add: ["$numRatings", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
            {
              $multiply: [0.2, "$likedPercent"],
            },
            {
              $cond: [
                {
                  $eq: ["$readCount", 0],
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$readCount", { $add: ["$readCount", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
            {
              $cond: [
                {
                  $eq: ["$numOfReviews", 0],
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$numOfReviews", { $add: ["$numRatings", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $sort: { popularityScore: -1 },
    },
    {
      $limit: 50,
    },
  ]);

  // console.log(popular_books)

  res.status(200).json({
    success: true,
    total: popular_books.length,
    popular_books,
  });
});

exports.getPopularBooksByGenre = catchAsyncErrors(async (req, res, next) => {
  const genre = req.params.genre;

  const matchStage = {
    $match: {
      $and: [{ numRatings: { $ne: null } }, { readCount: { $ne: null } }, { likedPercent: { $ne: null } }],
    },
  };

  if (genre) {
    matchStage.$match.$and.push({ genres: { $in: [genre] } });
  }

  console.log("matchStage", genre);
  console.log("req.header", req.header);

  const popular_books = await Book.aggregate([
    matchStage,
    {
      $addFields: {
        popularityScore: {
          $sum: [
            {
              $cond: [
                {
                  $eq: ["$numRatings", 0],
                },
                0,
                {
                  $multiply: [
                    0.4,
                    {
                      $divide: ["$numRatings", { $add: ["$numRatings", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
            {
              $multiply: [0.2, "$likedPercent"],
            },
            {
              $cond: [
                {
                  $eq: ["$readCount", 0],
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$readCount", { $add: ["$readCount", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
            {
              $cond: [
                {
                  $eq: ["$numOfReviews", 0],
                },
                0,
                {
                  $multiply: [
                    0.2,
                    {
                      $divide: ["$numOfReviews", { $add: ["$numRatings", "$numOfReviews"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $sort: { popularityScore: -1 },
    },
    {
      $limit: 50,
    },
  ]);

  // console.log(popular_books)

  res.status(200).json({
    success: true,
    total: popular_books.length,
    popular_books,
  });
});

exports.getTrendingBooks = catchAsyncErrors(async (req, res, next) => {
  const { genre } = req.body;

  console.log("inside getTrendingBooks", genre);
  console.log("inside getTrendingBooks", req.header);

  // const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const matchStage = {
    $match: {
      $and: [
        { numRatings: { $ne: null } },
        { readCount: { $ne: null } },
        { likedPercent: { $ne: null } },
        // { createdAt: { $gte: weekAgo } }
      ],
    },
  };

  if (genre) {
    matchStage.$match.$and.push({ genres: { $in: [genre] } });
  }
  const trendingBooks = await Book.aggregate([
    matchStage,
    {
      $addFields: {
        trendingScore: {
          //   $add: [
          //     { $multiply: ['$likedPercent', 0.4] },
          //     { $multiply: ['$numOfReviews', 0.3] },
          //     { $multiply: ['$readCount', 0.2] },
          //     { $multiply: ['$rating', 0.1] },
          //   ],
          $multiply: [
            { $cond: [{ $ne: ["$rating", 0] }, { $toDouble: "$rating" }, 1] },
            {
              $cond: [{ $ne: ["$numOfReviews", 0] }, { $divide: ["$numOfReviews", "$readCount"] }, 1],
            },
            {
              $cond: [{ $ne: ["$likedPercent", 0] }, { $divide: ["$likedPercent", 100] }, 1],
            },
          ],
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
});

// Get uploaded Books
exports.getUploadedBooks = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find({ userId: req.user.id });

  if (!books) {
    return next(new ErrorHandler("Books not found", 200));
  }

  res.status(200).json({
    books,
  });
});

// Get user favourite genre Books
exports.getFavouriteGenreBooks2 = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find({ userId: req.user.id });

  const userFavGenres = req.body.userFavGenres;

  // Use content-based filtering to filter books based on matching genres
  const matchedBooks = await Book.find({ $or: userFavGenres.map((genre) => ({ genre_1: genre })) }).select([
    "book_id",
    "title",
    "rating",
    "numRatings",
    "likedPercent",
  ]);

  const genreCounts = matchedBooks.map((book) => userFavGenres.filter((genre) => book.genre_1 === genre).length);
  const filteredBooks = matchedBooks.filter((_, i) => genreCounts[i] >= 2);

  // Use collaborative filtering to filter out books already read and highly rated by the user
  const userRatings = await BookInteraction.find({ Rating: { $gte: 4 } }).select("book_id");

  const userRatedBookIds = userRatings.map((rating) => rating.book_id);
  const collabFilteredBooks = filteredBooks.filter((book) => !userRatedBookIds.includes(book.book_id));

  // Calculate the weighted score for the remaining books
  const C = matchedBooks.reduce((sum, book) => sum + book.rating, 0) / matchedBooks.length;
  const m = matchedBooks.reduce((quantile, book) => Math.max(quantile, book.numRatings), 0.9);
  const booksWithWeightedScore = collabFilteredBooks.map((book) => ({
    ...book._doc,
    weighted_score: (book.numRatings / (book.numRatings + m)) * book.rating + (m / (book.numRatings + m)) * C,
  }));

  // Sort the books by weighted score and return the top 10 recommendations
  const recommendations = booksWithWeightedScore.sort((a, b) => b.weighted_score - a.weighted_score).slice(0, 10);

  res.status(200).json({
    recommendations,
  });
});

exports.getFavouriteGenreBooks = catchAsyncErrors(async (req, res, next) => {
  const userFavGenres = req.body.userFavGenres;

  // Use content-based filtering to filter books based on matching genres
  const matchedBooks = await Book.find({ $or: userFavGenres.map((genre) => ({ genres: genre })) });

  const genreCounts = matchedBooks.map((book) => userFavGenres.filter((genre) => book.genres === genre).length);
  const filteredBooks = matchedBooks.filter((_, i) => genreCounts[i] >= 2);

  // Calculate the weighted score for the filtered books
  const C = matchedBooks.reduce((sum, book) => sum + book.rating, 0) / matchedBooks.length;
  const m = matchedBooks.reduce((quantile, book) => Math.max(quantile, book.numRatings), 0.9);
  const booksWithWeightedScore = filteredBooks.map((book) => ({
    ...book._doc,
    weighted_score: (book.numRatings / (book.numRatings + m)) * book.rating + (m / (book.numRatings + m)) * C,
  }));

  // Sort the books by weighted score and return the top 10 recommendations
  const recommendations = booksWithWeightedScore.sort((a, b) => b.weighted_score - a.weighted_score).slice(0, 10);

  let total = matchedBooks.length;

  res.status(200).json({
    total,
    matchedBooks,
    recommendations,
  });
});

// Get text from pdf
exports.getTextFromPdf = catchAsyncErrors(async (req, res, next) => {
  const PDFParser = require("pdf-parse");

  const { pdf } = req.body;
  console.log("url ", req.body);

  await axios({
    method: "get",
    url: pdf ? pdf : "https://www.africau.edu/images/default/sample.pdf",
    responseType: "arraybuffer",
  })
    .then(async (response) => {
      const buffer = response.data;
      await PDFParser(buffer, { max: 1 })
        .then((pdfData) => {
          let text = pdfData.text;
          console.log("converted text", text);
          text = text.replace(/\n/g, "");
          res.status(200).json({
            data: text,
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            status: "error in pdf",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        status: "error in pdf",
      });
    });
});
