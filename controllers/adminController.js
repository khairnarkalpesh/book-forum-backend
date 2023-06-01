const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Admin = require("../models/admin");
const User = require("../models/userModel");
const sendTokenAdmin = require("../utils/jwtTokenAdmin");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { v4: uuidv4 } = require('uuid');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
// Register a admin
exports.registerAdmin = catchAsyncErrors(async (req, res, next) => {
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });

  const { name, email, password, genres } = req.body;

  const admin = await Admin.create({
    name,
    email,
    password,
    genres
    // avatar: {
    //   public_id: myCloud.public_id,
    //   url: myCloud.secure_url,
    // },
  });

  const token = admin.getJWTToken();

  sendTokenAdmin(admin, 201, res);
});

// Login admin
exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("inside backend")
  // Checking if admin have given email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await admin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const token = admin.getJWTToken();

  sendTokenAdmin(admin, 200, res);
});

// Logout admin
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
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    return next(new ErrorHandler("admin not found", 404));
  }

  // Generate OTP
  const uuid = uuidv4();
  const otp = uuid.replace(/\D/g, '').slice(0, 6); // Generate a 6-digit OTP using UUID v4

  // Save OTP and expiration time to admin document
  admin.resetPasswordOTP = otp;
  admin.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // OTP will expire in 10 minutes

  await admin.save();

  // const templatePath = path.resolve(__dirname, '..', 'views', 'emails', 'password_reset_template.hbs');
  // const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8'));
  // const data = { name: admin.name, otp };
  // const message = template(data);
  const message = `
Hello, ${admin.name}

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
      email: admin.email,
      subject: "Resetting you password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${admin.email} successfully...!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findOne({
    // email: req.body.email,
    resetPasswordOTP: req.body.otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!admin) {
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
  admin.password = req.body.password;

  // Clear OTP fields
  admin.resetPasswordOTP = undefined;
  admin.resetPasswordOTPExpires = undefined;

  await admin.save();

  // Return success message and token (if needed)
  sendTokenAdmin(admin, 200, res);
});


// Get admin details
exports.getAdminDetails = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);

  res.status(200).json({
    success: true,
    admin,
  });
});

// Update password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id).select("+password");

  const isPasswordMatched = await admin.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Wrong password", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password not matched", 401));
  }

  admin.password = req.body.newPassword;

  await admin.save();

  sendTokenAdmin(admin, 200, res);

  res.status(200).json({
    success: true,
    admin,
  });
});

// Update admin profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newAdminData = req.body;

  const admin = await Admin.findByIdAndUpdate(req.admin.id, newAdminData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json(admin);
});

// Get all admins (admin)
exports.getAllAdmins = catchAsyncErrors(async (req, res, next) => {
  const allAdmins = await Admin.find();

  res.status(200).json(allAdmins);
});

// Get admins (admin)
exports.getSingleAdmin = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new ErrorHandler("Admin Not Found!", 404));
  }

  res.status(200).json(admin);
});

// Update admin role -> Admin
exports.updateAdminRole = catchAsyncErrors(async (req, res, next) => {
  const newAdminData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const admin = await Admin.findByIdAndUpdate(req.admin.id, newAdminData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    admin,
  });
});

// Delete admin -> Admin
exports.deleteAdmin = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  await admin.remove();

  res.status(200).json({
    success: true,
    message: "Admin deleted!",
  });
});

// Get all users (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  console.log("hello")
  const allUsers = await User.find();

  res.status(200).json(allUsers);
});

// Get users (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }

  res.status(200).json(user);
});

// Update user role -> Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Delete user -> Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User deleted!",
  });
});


// Add to search history
exports.addSearch = catchAsyncErrors(async (req, res, next) => {
  const { text } = req.body;
  // const admin = await admin.findById(req.admin.id);

  // if (!admin) {
  //   return next(new ErrorHandler("admin not found", 404));
  // }

  if (!text) {
    return next(new ErrorHandler("Enter text", 401));
  }

  const admin = await Admin.findByIdAndUpdate(
    req.admin.id,
    { $addToSet: { searchHistory: { text } } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Search added",
    searchHistory: admin.searchHistory
  });

})

exports.deleteSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return res.status(404).send('admin not found');
  }

  admin.searchHistory = [];
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Search history deleted successfully",
    searchHistory: req.admin.searchHistory
  });
})

exports.deleteSearchRecord = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;

  const admin = await admin.findByIdAndUpdate(
    req.admin.id,
    { $pull: { searchHistory: { _id: id } } },
    { new: true }
  );

  if (!admin) {
    return res.status(404).json({ error: 'admin not found' });
  }

  res.status(200).json({
    success: true,
    message: "Search record deleted",
  });
})