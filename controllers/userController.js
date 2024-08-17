const { catchAsyncErrors } = require('../middlewares/catchAsyncError')
const  User  = require('../models/userModel');
const nodemailer=require('nodemailer')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const { sendmail } = require('../utils/nodemailer')
const mongoose = require('mongoose')
const ErrorHandler = require('../utils/ErrorHandler')
const imagekitClient=require('../utils/imagekit').initimagekit()
const {v4: uuidv4 } = require('uuid');

const currentUser=catchAsyncErrors(async(req,res,next)=>{
    try {
        console.log(req)
        // Retrieve user ID from the request object (set by the isAuthenticated middleware)
        const userId = req.id;

        // Find the user in the database based on the ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Set isAuth property if needed
        user.isAuth = true;

        // Send user data in the response
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

const registerUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        // Check if user already exists
        console.log(req.body)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password before saving
        const user = await  User.create({
            name,
            email,
            phoneNumber,
            password
        });

       
        
        sendToken(user, 201, res);

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message });
    }
});

const loginUser=catchAsyncErrors(async(req,res,next)=>{
    try {
        console.log(req.body);
        const { email, password } = req.body.formData;

        // Find the user by email
        const user = await User.findOne({ email });

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password matches
        const isPasswordMatch = await user.comparePassword(password);

        // If password does not match, return 401
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If everything is correct, send token
        sendToken(user, 200, res);
    } catch (error) {
        console.error('Error in login controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = {
    registerUser,
    currentUser,
    loginUser
};