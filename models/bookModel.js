// const mongoose = require("mongoose");

// const bookSchema = new mongoose.Schema({
//   book_id: {
//     type: Number,
//   },
//   title: {
//     type: String,
//     required: [true, "Please enter Book title"],
//   },
//   authors: {
//     type: String,
//     required: [true, "Please enter Book author"],
//   },
//   isbn: {
//     type: Number,
//     required: false,
//   },
//   genre1: {
//     type: String
//   },
//   genre2: {
//     type: String
//   },
//   genre3: {
//     type: String
//   },
//   genre4: {
//     type: String
//   },
//   genre5: {
//     type: String
//   },
//   genre6: {
//     type: String
//   },
//   genre7: {
//     type: String
//   },
//   genre8: {
//     type: String
//   },
//   ratings: {
//     type: Number,
//     default: 0,
//   },
//   ratingsCount: {
//     type: Number,
//     default: 0,
//   },
//   likedPercent: {
//     type: Number,
//     default: 0,
//   },
//   bbScore: {
//     type: Number,
//     default: 0,
//   },
//   bbVotes: {
//     type: Number,
//     default: 0,
//   },
//   numOfReviews: {
//     type: Number,
//     default: 0,
//   },
//   reviews: [
//     {
//       user: {
//         type: mongoose.Schema.ObjectId,
//         ref: "User",
//         required: true,
//       },
//       name: {
//         type: String,
//         required: true,
//       },
//       rating: {
//         type: Number,
//         required: true,
//       },
//       comment: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Book = mongoose.model('Book', bookSchema);

// const bookInteractionSchema = new mongoose.Schema({
//   user_id: { type: String, required: true },
//   book_id: { type: String, required: true },
//   is_read: {
//     type: Number,
//     default: 0
//   },
//   rating: {
//     type: Number,
//     min: 1,
//     max: 5
//   },
//   is_reviewed: {
//     type: Number,
//     default: 0
//   },
//   last_interaction_date: {
//     type: Date,
//     default: Date.now
//   }
// });

// const BookInteraction = mongoose.model('BookInteraction', bookInteractionSchema);

// module.exports = {
//   Book,
//   BookInteraction
// };

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
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
  },
  likedPercent: {
    type: Number,
    required: true,
  },
  numRatings: {
    type: Number,
    required: true,
  },
});

const Book = mongoose.model('Book', bookSchema);
const BookInteraction = mongoose.model('BookInteraction', bookInteractionSchema);

module.exports = {
  Book,
  BookInteraction,
};
