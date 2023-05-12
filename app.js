const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const { Book } = require("./models/bookModel")
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
app.use(fileUpload({
    useTempFiles:true,
    // limits:{fileSize: }
}));

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

// Middleware for errors
app.use(errorMiddleware);

module.exports = app;
