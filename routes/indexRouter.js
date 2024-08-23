const { currentUser, registerUser, loginUser,getEventDetailsById,getAllEvents, uploadEvent,toggleFavourite, favoriteEvent } = require("../controllers/userController");
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
module.exports=router