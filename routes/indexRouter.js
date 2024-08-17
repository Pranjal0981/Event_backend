const { currentUser, registerUser, loginUser } = require("../controllers/userController");
const express=require('express');
const { isAuthenticated } = require("../middlewares/auth");
const router=express.Router()

router.post('/registerUser',registerUser)

router.post('/currentUser',isAuthenticated,currentUser)

router.post('/loginUser',isAuthenticated,loginUser)

module.exports=router