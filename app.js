const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const Book = require("./models/bookModel")
// Routes import
const user = require("./routes/userRoute");
const admin = require("./routes/adminRoute");
const book = require("./routes/bookRoute");
const email = require("./routes/email");
const discussion = require("./routes/discussionRoute");
const recommendationRoute = require("./routes/recommendationRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const whishlist = require("./routes/whishlistRoute");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/v1", user);
app.use("/api/v1", admin);
app.use("/api/v1", book);
app.use("/api/v1", recommendationRoute);
app.use("/api/v1", whishlist);
app.use("/api/v1", discussion);
app.use("/api/v1", email);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/v1/books/popular', async (req, res) => {
    try {
        // Calculate the popularity score
        const popularityScore = await Book.aggregate([
            {
                $group: {
                    _id: '$book_id',
                    is_read: { $sum: '$numOfReviews' },
                    rating_y: { $avg: '$average_rating' },
                    likedPercent: { $avg: { $divide: ['$ratings_5', '$ratings_count'] } },
                    numRatings: { $avg: '$ratings_count' },
                }
            },
            // {
            //     $project: {
            //         popularity: {
            //             $add: [
            //                 { $divide: ['$is_read', { $sum: '$is_read' }]  },
            //                 '$rating_y',
            //                 '$likedPercent',
            //                 '$numRatings',
            //             ],
            //         },
            //     }
            // },
            { $sort: { popularity: -1 } },
            { $limit: 5 },
        ]);

        // Get the top 50 popular books
        const popularBooks = await Book.find({ book_id: { $in: popularityScore.map(score => score._id) } })
            .sort({ ratings_count: -1 })
            .limit(5);


            console.log(popularBooks.length)
        res.send(popularBooks);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


// Middleware for errors
app.use(errorMiddleware);

module.exports = app;
