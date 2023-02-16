const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");

// Routes import
const user = require("./routes/userRoute");
const book = require("./routes/bookRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/v1", user);
app.use("/api/v1", book);

app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Middleware for errors
app.use(errorMiddleware);

module.exports = app;
