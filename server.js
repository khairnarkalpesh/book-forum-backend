const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");
// Handling uncaught exceptins
process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.log("Shutting down the server due to unhandled uncaught exceptins");
});

// config
dotenv.config({ path: "./.env" });

// database connection
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port : ", process.env.PORT);
});

console.log(mongoose.models)

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log("Shutting down the server due to unhandled promise rejections");

  server.close(() => {
    process.exit(1);
  });
});
