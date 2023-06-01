const express = require("express");
const router = express.Router();
const Wishlist = require("../models/whishlistModel");
const {Book} = require("../models/bookModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.addWhishlist = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.body.bookId;
    const userId = req.user.id;

    const book = await Book.findById(bookId);

    console.log(book)

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        console.log("inside if")
        // If wishlist not found for user, create a new wishlist with the book
        wishlist = await Wishlist.create({ user: userId, books: { book: book } });
        await wishlist.save();
        return res.status(201).json(wishlist);
    } else {
        // If wishlist found for user, add book to wishlist
        console.log("inside else")
        wishlist.books.push({ book });
        await wishlist.save();
        return res.json(wishlist);
    }
})

exports.removeBook = catchAsyncErrors(async (req, res, next) => {
    const id = req.body.id;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { books: { _id: id } } },
        { new: true }
    );

    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }

    return res.json(wishlist);
});

exports.getWhishlist = catchAsyncErrors(async (req, res) => {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }

    return res.json(wishlist.books);
})

exports.clearWishlist = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        return res.status(404).json({ error: "Wishlist not found" });
    }

    wishlist.books = [];
    await wishlist.save();

    return res.json(wishlist);
});