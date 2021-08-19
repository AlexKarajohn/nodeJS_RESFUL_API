const express = require('express');
const {body} = require('express-validator/check');
const router = express.Router();
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth')

router.get('/post/:postId',isAuth,feedController.getPost)

router.post('/post',isAuth,[
        body('title')
            .trim()
            .isLength({min:5}),
        body('content')
            .trim()
            .isLength({min:5}),
    ],feedController.createPost)

router.get('/posts',isAuth,feedController.getPosts)

router.put('/post/:postId',isAuth,[
        body('title')
            .trim()
            .isLength({min:5}),
        body('content')
            .trim()
            .isLength({min:5}),
    ],feedController.putPost)

router.delete('/post/:postId',isAuth, feedController.deletePost);



module.exports = router;