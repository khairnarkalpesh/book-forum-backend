const express = require("express");
const app = express();
const fs = require("fs");
const { PythonShell } = require("python-shell");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.popularBooks = catchAsyncErrors(async (req, res) => {
    const n = req.query.n || 10; // Number of books to recommend

    // Load the saved model from a file
    const modelPath = require("../ml-models/popular_books.pkl");  
    const model = fs.readFileSync(modelPath);

    // Call the Python script to get the recommended books
    const options = {
        mode: "text",
        pythonPath: "python",
        pythonOptions: ["-u"],
        scriptPath: "",
        args: [n],
        stdin: model,
    };
    PythonShell.run("get_popular_books.py", options, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error occurred while getting popular books");
        } else {
            const recommendedBooks = JSON.parse(results[0]);
            res.send(recommendedBooks);
        }
    });
});

app.listen(3000, () => console.log("Server started on port 3000"));
