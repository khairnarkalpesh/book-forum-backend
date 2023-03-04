const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { Comment, Reply } = require("../models/discussionModel")
// const  = require("../models/discussionModel")

exports.addComment = catchAsyncErrors(async (req, res, next) => {
    const { bookId, content } = req.body;
    const userId = req.user.id

    const comment = await Comment.create({
        bookId,
        userId,
        content
    });

    await comment.save();
    res.json(comment);

})

exports.addReply = catchAsyncErrors(async (req, res, next) => {
    const { commentId, content } = req.body;
    req.body.userId = req.user.id
    const data = req.body;

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: data } },
        { new: true }
    );
    res.json(comment);

})