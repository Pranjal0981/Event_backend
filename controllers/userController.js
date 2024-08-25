const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const { sendToken } = require('../utils/sendToken');
const ErrorHandler = require('../utils/ErrorHandler');
const imagekit=require('../utils/imagekit').initimagekit()
const Event=require('../models/eventModel')
const FavoriteEvent=require('../models/favorite')
const {sendmail}=require('../utils/nodemailer')
// Middleware to handle async errors
const currentUser = catchAsyncErrors(async (req, res, next) => {
  try {
      // Retrieve user ID from the request object (set by the isAuthenticated middleware)
      const userId = req.id;
console.log(userId)
      // Find the user in the database based on the ID
      const user = await User.findById(userId);

      // If user not found, return 404
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }
      console.log(user)
      // Send user data in the response
      res.json({ success: true, user });
  } catch (error) {
      // Log the error and return a 500 status code for internal server error
      console.error('Error fetching current user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const registerUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Create the user with hashed password
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password
        });

        // Send token after successful registration
        sendToken(user, 201, res);
    } catch (error) {
        console.log('Error registering user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const loginUser = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(req.body)
      const { email, password } = req.body;

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

      // If everything is correct, send a JWT token as a response
      sendToken(user, 200, res);
  } catch (error) {
      // Log the error and return a 500 status code for internal server error
      console.error('Error in login controller:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

const uploadEvent = catchAsyncErrors(async (req, res, next) => {
  try {
    const { title, description, location,eventType, date, price, userId } = req.body;
    console.log(req.body)
    const image = req.files?.image; // Access the image from req.files

    // Log the image details for debugging
    console.log('Image Details:', image);

    if (!title || !description || !location || !date || !price || !image) {
      return res.status(400).json({ message: 'All fields and image are required' });
    }

    // Upload image to ImageKit
    const imageUploadResponse = await imagekit.upload({
      file: image.data, // Use image.data for the file buffer
      fileName: image.name, // Use image.name for the file name
      folder: 'events', // Optional folder to organize images
    });

    const imageUrl = imageUploadResponse.url; // URL of the uploaded image

    // Create a new event instance
    const event = new Event({
      title,
      userId,
      description,
      location,
      date: new Date(date),
      price,
      eventType,
      image: {
        url: imageUrl,
        fieldId: imageUploadResponse.fileId,
      },
    });

    // Ensure `event` is an instance of the Mongoose model
    console.log('Event Instance:', event);
    console.log('Event Instance Type:', event.constructor.name);

    // Save the event to the database
    await event.save();

    // Send success response
    res.status(201).json({
      message: 'Event uploaded successfully',
      event,
    });
  } catch (error) {
    console.error('Error during event upload:', error); // Detailed error logging
    next(error); // Pass errors to error-handling middleware
  }
});

const getAllEvents = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all events from the database
    const events = await Event.find();
    console.log(events)

    // Send the fetched events as a response
    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    // Pass errors to the next middleware
    next(error);
  }
})

const toggleFavourite = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, eventId } = req.body;
console.log(req.body)
    if (!userId || !eventId) {
      return res.status(400).json({ success: false, message: 'User ID and Event ID are required' });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if there's an existing favorite entry for this user and event
    let favoriteEntry = await FavoriteEvent.findOne({ userId, eventId });

    if (favoriteEntry) {
      // Remove from favorites
      await FavoriteEvent.deleteOne({ userId, eventId });
      return res.status(200).json({ success: true, isFavorite: false });
    } else {
      // Add to favorites
      favoriteEntry = new FavoriteEvent({ userId, eventId });
      await favoriteEntry.save();
      return res.status(200).json({ success: true, isFavorite: true });
    }
  } catch (error) {
    next(error);
  }
});


const favoriteEvent = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.query.userId; // Get userId from query parameter
console.log(userId)
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find all favorite events for the user and populate the event details
    const favorites = await FavoriteEvent.find({ userId: userId }).populate('eventId');
console.log(favorites)
    // Extract events from the populated favorites
    const events = favorites.map(fav => fav.eventId);

    res.status(200).json({ favoriteEvents: events });
  } catch (error) {
    console.error('Failed to fetch favorite events:', error);
    res.status(500).json({ message: 'Failed to fetch favorite events' });
  }
});

const getEventDetailsById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Get eventId from request parameters

  // Find the event by ID
  const event = await Event.findById({_id:id});
console.log(event)
  // If no event is found, send a 404 response
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Send the event details in the response
  res.status(200).json({
    success: true,
    data: event,
  });
});

const searchEvents=catchAsyncErrors(async(req,res,next)=>{
  const query = req.query.query || '';

    try {
        // Perform a case-insensitive search for events
        const events = await Event.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
                { eventType: { $regex: query, $options: 'i' } },
            ],
        }).exec();
        console.log(events)

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'An error occurred while searching for events.' });
    }
})

const yourEvents = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the userId is available in req.user

    // Fetch events from the database that match the userId
    const events = await Event.find({ userId:id });

    // Return the user's events
    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
});

// Controller to request OTP for password reset
const requestOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
      return next(new ErrorHandler('User not found', 404));
  }

  // Generate OTP and store in user document
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  user.otp = otp;
  await user.save();

  // Send OTP via email
  await sendmail(req,res,next, otp);

  res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
  });
});

const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
console.log(req.body)
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Find the user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  // Check if the provided OTP matches the stored OTP
  if (user.otp !== otp) {
    console.log(user.otp == otp)
    return res.status(400).json({ message: 'Invalid OTP' });
  }


  user.password = newPassword

  // Reset OTP
  user.otp = -1;

  // Save the updated user
  await user.save();

  // Respond with success message
  res.status(200).json({ message: 'Password reset successful' });
});


module.exports = {
    registerUser,
    currentUser,
    loginUser,
    uploadEvent,
    getAllEvents,
    toggleFavourite,
    favoriteEvent,
    getEventDetailsById,
    searchEvents,
    yourEvents,
    requestOtp,
    verifyOtp
};
