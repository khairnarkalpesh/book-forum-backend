const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { Comment, Reply } = require("../models/discussionModel")
// const  = require("../models/discussionModel")

exports.addComment = catchAsyncErrors(async (req, res, next) => {
    const { bookId, content } = req.body;
    const userId = req.user.id
    const userName = req.user.name

    const comment = await Comment.create({
        bookId,
        userId,
        userName,
        content
    });

    await comment.save();
    res.json(comment);

})

exports.addReply = catchAsyncErrors(async (req, res, next) => {
    const { commentId, content } = req.body;
    req.body.userId = req.user.id
    req.body.userName = req.user.name
    
    const data = req.body;

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: data } },
        { new: true }
    );
    res.json(comment);

})

exports.getComments = catchAsyncErrors(async (req, res, next) => {

    const comments = await Comment.find({ bookId: req.params.bookId });
    
    if (!comments) {
        return next(new ErrorHandler("Comments not found", 200));
      }
    
    res.json(comments);



})