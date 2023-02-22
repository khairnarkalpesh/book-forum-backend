const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  book_id: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  goodreads_book_id: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  best_book_id: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  work_id: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  books_count: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  books_count: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  isbn: {
    type: Number,
    required: [false, "Please enter Book description"],
  },
  authors: {
    type: String,
    required: [false, "Please enter Book description"],
  },
  original_publication_year: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  original_title: {
    type: String,
    required: [false, "Please enter Book price"],
  },
  title: {
    type: String,
    required: [false, "Please enter Book price"],
  },
  language_code: {
    type: String,
    required: [false, "Please enter Book price"],
  },
  average_rating: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_count: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  work_ratings_count: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  work_text_reviews_count: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_1: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_2: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_3: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_4: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  ratings_5: {
    type: Number,
    required: [false, "Please enter Book price"],
  },
  image_url: {
    type: String,
    required: [false, "Please enter Book price"],
  },
  small_image_url: {
    type: String,
    required: [false, "Please enter Book price"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [false, "Please enter Book category"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", BookSchema);
