exports.sendToken = (user, statusCode, res) => {
    const token = user.getjwttoken();
    const expiresInMilliseconds = process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + expiresInMilliseconds);

    const options = {
        expires: expirationDate,
        httpOnly: true,
        sameSite: 'none',
        secure: false  // Ensure secure is false for development
    };

    console.log(options);
    console.log(token);

    res.status(statusCode)
       .cookie("token", token, options)
       .json({ success: true, id: user._id, token, expiresIn: expiresInMilliseconds });
};
