const mongoose = require('mongoose');

const bookInteractionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  book_id: { type: String, required: true },
  is_read: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  is_reviewed: {
    type: Number,
    default: 0
  },
  genre: {
    type: String,
  },
  last_interaction_date: {
    type: Date,
    default: Date.now
  }
});

const bookSchema = new mongoose.Schema({
  book_id: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  series: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: false
  },
  rating: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  language: {
    type: String,
    required: false
  },
  isbn: {
    type: String,
    required: false
  },
  genres: {
    type: [String],
    required: false
  },
  genre1: {
    type: String,
    required: false
  },
  genre2: {
    type: String,
    required: false
  },
  genre3: {
    type: String,
    required: false
  },
  genre4: {
    type: String,
    required: false
  },
  genre5: {
    type: String,
    required: false
  },
  genre6: {
    type: String,
    required: false
  },
  genre7: {
    type: String,
    required: false
  },
  genre8: {
    type: String,
    required: false
  },
  genre9: {
    type: String,
    required: false
  },
  characters: {
    type: [String],
    required: false
  },
  edition: {
    type: String,
    required: false
  },
  pages: {
    type: Number,
    required: false
  },
  publisher: {
    type: String,
    required: false
  },
  coverImg: {
    type: String,
    required: false
  },
  pdfUrl: {
    type: String,
    required: false
  },
  awards: {
    type: [String],
    required: false
  },
  numRatings: {
    type: Number,
    default: 0,
  },
  readCount: {
    type: Number,
    default: function () {
      return Math.floor(Math.random() * (50000 - 50 + 1)) + 50;
    }
  },
  likedPercent: {
    type: Number,
    default: 0,
  },
  bbeScore: {
    type: Number,
    default: 0,
  },
  bbeVotes: {
    type: Number,
    default: 0,
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
      profileImage: {
        type: String,
        required: false
      }
    },
  ],
  user: {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model('Book', bookSchema);
const BookInteraction = mongoose.model('BookInteraction', bookInteractionSchema);

module.exports = {
  Book,
  BookInteraction,
};
