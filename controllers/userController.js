const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { v4: uuidv4 } = require('uuid');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });

  const { name, email, password, genres } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    genres
    // avatar: {
    //   public_id: myCloud.public_id,
    //   url: myCloud.secure_url,
    // },
  });

  const token = user.getJWTToken();

  sendToken(user, 201, res);
});

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("inside backend")
  // Checking if user have given email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const token = user.getJWTToken();

  sendToken(user, 200, res);
});

// Logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 200));
  }

  // Generate OTP
  const uuid = uuidv4();
  const otp = uuid.replace(/\D/g, '').slice(0, 6); // Generate a 6-digit OTP using UUID v4

  // Save OTP and expiration time to user document
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // OTP will expire in 10 minutes

  await user.save();

  // const templatePath = path.resolve(__dirname, '..', 'views', 'emails', 'password_reset_template.hbs');
  // const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
  // const data = { name: user.name, otp };
  // const message = template(data);
  const message = `
  Hello, ${user.name}

  Forgot Your Password?

  Please use the following One-Time Password (OTP) to reset your password:

  ${otp}

  If you did not request a password reset, please ignore this email.

  Thanks
  `;

  // Send OTP via email or SMS (not shown)
  // const message = `Your password reset OTP is: ${otp}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Resetting you password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email} successfully...!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({
    // email: req.body.email,
    email:req.body.email,
    resetPasswordOTP: req.body.otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Invalid OTP or OTP has expired",
        201
      )
    );
  }

  res.status(200).json({
    success: true,
    message: "OTP Verified",
  });


});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorHandler(
        "Invalid OTP or OTP has expired",
        404
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password not matched", 404));
  }

  // Reset password
  user.password = req.body.password;

  // Clear OTP fields
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save();

  // Return success message and token (if needed)
  sendToken(user, 200, res);
});


// Get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Wrong password", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password not matched", 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = req.body;

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json(user);
});

// Get all users (admin)
// exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
//   const allUsers = await User.find();

//   res.status(200).json(allUsers);
// });

// Get users (admin)
// exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     return next(new ErrorHandler("User Not Found!", 404));
//   }

//   res.status(200).json(user);
// });

// Update user role -> Admin
// exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
//   const newUserData = {
//     name: req.body.name,
//     email: req.body.email,
//     role: req.body.role,
//   };

//   const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   res.status(200).json({
//     success: true,
//     user,
//   });
// });

// Delete user -> Admin
// exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }

//   await user.remove();

//   res.status(200).json({
//     success: true,
//     message: "User deleted!",
//   });
// });


// Add to search history
exports.addSearch = catchAsyncErrors(async (req, res, next) => {
  const { text } = req.body;
  // const user = await User.findById(req.user.id);

  // if (!user) {
  //   return next(new ErrorHandler("User not found", 404));
  // }

  if (!text) {
    return next(new ErrorHandler("Enter text", 401));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { searchHistory: { text } } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Search added",
    searchHistory: user.searchHistory
  });

})

exports.deleteSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  user.searchHistory = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: "Search history deleted successfully",
    searchHistory: req.user.searchHistory
  });
})

exports.deleteSearchRecord = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { searchHistory: { _id: id } } },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    success: true,
    message: "Search record deleted",
  });
})

exports.getSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  res.status(200).json({
    success: true,
    searchHistory: req.user.searchHistory
  });
})