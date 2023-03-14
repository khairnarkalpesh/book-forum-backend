// Create token and save in cookie

const sendTokenAdmin = (admin, statusCode, res) => {
    const token = admin.getJWTToken();
    console.log("my token", token)
    // Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        admin
    });
};

module.exports = sendTokenAdmin;