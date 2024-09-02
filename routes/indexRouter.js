const { currentUser, registerUser,applyFilter,updateProfile,updateBookingStatus,logout,fetchBookings,searchEvents,yourEvents,requestOtp, loginUser,getEventDetailsById,getAllEvents, uploadEvent,toggleFavourite, favoriteEvent, verifyOtp, paymentVerification, checkout,deleteEvents } = require("../controllers/userController");
const express=require('express');
const { isAuthenticated } = require("../middlewares/auth");
const router=express.Router()

router.post('/registerUser',registerUser)

router.post('/currentUser',isAuthenticated,currentUser)

router.post('/login',loginUser)

router.post('/upload-event',isAuthenticated,uploadEvent)

router.get('/getEvents',getAllEvents)

router.post('/toggle-favorite',isAuthenticated,toggleFavourite)

router.get('/getFavoriteEvents',favoriteEvent)

router.get('/getEvent/:id',getEventDetailsById)

router.get('/events/search',searchEvents);

router.get('/your-events/:id',isAuthenticated,yourEvents)

router.post('/request-otp',requestOtp)

router.post('/verify-otp',verifyOtp)

router.post('/logout',isAuthenticated,logout)

router.post("/checkout",isAuthenticated,checkout);

router.post("/verify-payment", isAuthenticated,paymentVerification);

router.delete('/deleteEvents/:id',isAuthenticated,deleteEvents)

router.get('/applyFilters',applyFilter)

router.post('/updateupdate-booking-status',isAuthenticated,updateBookingStatus)

router.get('/fetchBookings',isAuthenticated,fetchBookings)

router.put('/updateProfile/:userId',isAuthenticated,updateProfile)
module.exports=router
module.exports=router