const { currentUser, registerUser,searchEvents,yourEvents,requestOtp, loginUser,getEventDetailsById,getAllEvents, uploadEvent,toggleFavourite, favoriteEvent, verifyOtp } = require("../controllers/userController");
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
module.exports=router