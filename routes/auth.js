const express = require('express');
const {body} = require('express-validator/check');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/isAuth')

router.put('/signup',[
    body('email')
        .isEmail()
        .custom((email,{req})=>{
            return User.findOne({email:email})
                    .then((user)=>{
                        console.log(user)
                        if(user)
                         return Promise.reject('Email Address already exists!');
                    })
        })
        .normalizeEmail({ gmail_remove_dots: false }),
    body('password')
        .trim()
        .isLength({min:5}),
    body('name')
    .trim()
    .not()
    .isEmpty(),
],authController.putSignup)

router.post('/login',authController.postLogin);

router.get('/status',isAuth,authController.getStatus);
router.put('/status',isAuth,[
    body('status')
        .trim()
        .isLength({min:2})
],authController.putStatus);
module.exports = router;