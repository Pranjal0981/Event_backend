const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const { sendToken } = require('../utils/sendToken');
const ErrorHandler = require('../utils/ErrorHandler');
const imagekit=require('../utils/imagekit').initimagekit()
const Event=require('../models/eventModel')
const FavoriteEvent=require('../models/favorite')
const {sendmail}=require('../utils/nodemailer')
const crypto = require('crypto');
const QRCode = require('qrcode');
const Razorpay = require('razorpay');
const Payment=require('../models/payment')
const mongoose=require('mongoose')
const Booking=require('../models/booking')
const { v4: uuidv4 } = require('uuid'); // Import UUID for generating unique names

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
        console.log(req.body)
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

const searchEvents = catchAsyncErrors(async (req, res, next) => {
  const query = req.query.query || '';

  try {
    // Perform a case-insensitive search across multiple fields
    const events = await Event.find({
      $or: [
        { location: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { eventType: { $regex: query, $options: 'i' } },
      ]
    }).exec();

    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found matching the query.' });
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'An error occurred while searching for events.' });
  }
});


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




const axios = require('axios');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
});


const checkout = catchAsyncErrors(async (req, res) => {
  try {
      const options = {
          amount: Number(req.body.amount * 100), // Amount in paise
          currency: 'INR',
          receipt: req.body.receipt || 'receipt#1', // Optional receipt reference
      };

      console.log(instance)
      const order = await new Promise((resolve, reject) => {
          instance.orders.create(options, (err, order) => {
              if (err) {
                  return reject(err);
              }
              resolve(order);
          });
      });

      console.log('Order created:', order);
      res.status(200).json({
          success: true,
          order,
      });
  } catch (error) {
      console.error('Error in checkout:', error);
      res.status(500).json({
          success: false,
          error: 'Failed to create order',
      });
  }
});


const paymentVerification = catchAsyncErrors(async (req, res) => {
  try {
    const { 
      payment_id, 
      userId, 
      eventId, 
      signature, 
      orderId, 
      numberOfPeople 
    } = req.body;

    console.log('Request Body:', req.body);

    // Validate and convert IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId or eventId format',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    console.log('Converted User ObjectId:', userObjectId);
    console.log('Converted Event ObjectId:', eventObjectId);

    // Verify the Razorpay payment signature
    const body = `${payment_id}|${orderId}`;
    console.log('Body used for signature generation:', body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest('hex');

    console.log('Expected Signature:', expectedSignature);
    console.log('Received Signature:', signature);

    if (signature) {
      // Generate QR code with booking details
      const qrData = {
        bookingId: new mongoose.Types.ObjectId(), // Generate a new ObjectId
        userId: userObjectId,
        eventId: eventObjectId,
        numberOfPeople,
      };

      console.log('QR Data:', qrData);
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      console.log('Generated QR Code:', qrCode);

      // Create and save the booking
      const booking = new Booking({
        _id: qrData.bookingId,
        userId: userObjectId,
        eventId: eventObjectId,
        numberOfPeople,
        qrCode, // Include QR code in the booking
        isVerified: false, // Mark as not verified initially
      });

      await booking.save();
      console.log('Booking Saved:', booking);

      // Create and save the payment record
      const payment = new Payment({
        payment_id,
        signature,
        orderId,
        userId: userObjectId,
        eventId: eventObjectId,
        numberOfPeople,
        qrCode,
      });

      await payment.save();
      console.log('Payment Saved:', payment);

      // Respond with success
      res.status(200).json({
        success: true,
        message: 'Payment verification successful',
        qrCode,
      });
    } else {
      // Signature mismatch
      console.error('Signature mismatch');
      res.status(400).json({
        success: false,
        error: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({
      success: false,
      error: 'Server error occurred',
    });
  }
});



const fetchBookings = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId } = req.query; // Get userId from route parameters

    // Validate the userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      });
    }

    // Fetch bookings from the database and populate eventId and userId fields
    const bookings = await Booking.find({ userId })
      .populate('eventId') // Populate eventId with event details
      .populate('userId', 'firstName lastName email'); // Populate userId with specific fields (e.g., name and email)

    console.log(bookings);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found for this user',
      });
    }

    // Respond with the bookings
    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error occurred',
    });
  }
});


const updateBookingStatus=catchAsyncErrors(async(req,res,next)=>{
  try {
    
  } catch (error) {
    
  }
})

const logout = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token")
  res.json({ message: "Successfully Signout" })
})

const updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
      const { firstName, lastName, email, phoneNumber, address } = req.body;
      const userId = req.params.userId; // Ensure this comes from authentication middleware

      // Access the uploaded image from req.files
      const imageFile = req.files && req.files.image;

      // Validate required fields
      if (!firstName || !lastName || !email) {
          return res.status(400).json({
              success: false,
              message: 'First name, last name, and email are required.',
          });
      }

      let imageUrl = null;
      let imageFieldId = null;

      // Handle file upload
      if (imageFile) {
          // Generate a unique file name using UUID
          const uniqueFileName = `${uuidv4()}.jpg`; // Adjust the extension if needed

          // Read the image file data
          const fileData = imageFile.data;

          const uploadResponse = await imagekit.upload({
              file: fileData, // Upload the file data
              fileName: uniqueFileName, // Use the unique file name here
              folder: 'user_images' // Optional: specify a folder in ImageKit
          });

          imageUrl = uploadResponse.url;
          imageFieldId = uploadResponse.fileId;
      }

      // Update user profile
      const user = await User.findByIdAndUpdate(
          userId,
          {
              firstName,
              lastName,
              email,
              phoneNumber,
              address,
              ...(imageUrl && imageFieldId ? { image: { url: imageUrl, fieldId: imageFieldId } } : {})
          },
          { new: true, runValidators: true }
      );

      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found.',
          });
      }

      res.status(200).json({
          success: true,
          message: 'Profile updated successfully.',
          user,
      });
  } catch (error) {
      console.error('Error updating profile:', error); // Log the error for debugging
      res.status(500).json({
          success: false,
          message: 'Internal server error.',
      });
  }
});


const deleteEvents = catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Find and delete the event by its ID
      const event = await Event.findByIdAndDelete(id);
  
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
  
      // Return a success response
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      // Handle any errors that occur
      return next(error); // Forward the error to the global error handler
    }
  });
  
const applyFilter = catchAsyncErrors(async (req, res, next) => {
    try {
      const { city, price, type } = req.query;
  
      // Parse query parameters and ensure they are arrays
      const locations = Array.isArray(city) ? city : city ? [city] : [];
      const prices = Array.isArray(price) ? price : price ? [price] : [];
      const eventTypes = Array.isArray(type) ? type : type ? [type] : [];
  
      // Log the received filters for debugging
      console.log('Locations:', locations);
      console.log('Prices:', prices);
      console.log('Event Types:', eventTypes);
  
      // Construct your query or filter logic here
      const filters = {};
  
      if (locations.length > 0) {
        filters.location = { $in: locations }; // Ensure location field matches
      }
  
      if (prices.length > 0) {
        // Convert prices to numbers and ensure they are valid
        filters.price = { $in: prices.map(price => {
          const num = Number(price.replace(/[^0-9.-]+/g, '')); // Remove non-numeric characters
          return isNaN(num) ? null : num;
        }).filter(num => num !== null) }; // Remove invalid numbers
      }
  
      if (eventTypes.length > 0) {
        filters.eventType = { $in: eventTypes }; // Ensure eventType field matches
      }
  
      // Log the constructed filters
      console.log('Constructed Filters:', filters);
  
      // Fetch data from the database (e.g., MongoDB)
      const data = await Event.find(filters);
  
      // Log fetched data
      console.log('Fetched Data:', data);
  
      // Respond with the filtered data
      res.status(200).json({
        success: true,
        events: data,
      });
    } catch (error) {
      // Pass errors to the global error handler
      next(error);
    }
  });
  ;
  

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
    verifyOtp,
    checkout,
    paymentVerification,
    logout,
    deleteEvents,
    applyFilter,
    updateBookingStatus,
    fetchBookings,
    updateProfile
};
