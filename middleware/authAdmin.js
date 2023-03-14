const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isAuthenticatedAdmin = catchAsyncErrors( async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decodedData.id);

    next();

});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if(!roles.includes(req.admin.role)){
            return next(
                new ErrorHandler(`Role : ${req.admin.role} is not allowed to access`, 403)
            );
        }

        next();
    }
}