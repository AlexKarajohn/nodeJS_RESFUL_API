const {validationResult} = require('express-validator/check')
const Post = require('../models/post')
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
exports.getPost = async (req,res,next) =>{
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId);
            if(!post){
                const error = new Error ('Could not find Post')
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message:'Post fetched',
                post
            })
    }        
    catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
    }

}

exports.getPosts = async (req,res,next) => {
    const currentPage = req.query.page || 1;
    const perPage = 3;
    try{
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find()
                                .populate('creator')
                                .skip((currentPage -1 ) * perPage)
                                .limit(perPage);
    res.status(200).json({
            message: 'Posts fetched',
            posts,
            totalItems,
        })
    }
    catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
    }

}
exports.createPost = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error ('validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error = new Error ('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.userId;
    let creator;
    try{
        const post = new Post({
            title,
            content,
            creator: userId,
            imageUrl,
        })
        const postSaveResult = await post.save()
        const user = await User.findById(userId)
        user.posts.push(postSaveResult);
        await user.save();
        res.status(201).json({
            message: 'Post created Successfully',
            post: postSaveResult,
            creator: {_id: user._id, name : user.name}
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putPost = async (req,res,next) =>{
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error ('validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error ('No File Picked')
        error.statusCode = 422;
        throw error;
    }
    try{
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error ('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString()!==req.userId.toString()){
            const error = new Error ('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const addedPost = await post.save();
        res.status(200).json({
            message: 'Post Updated',
            post: addedPost,
        })
    }
    catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
}

exports.deletePost = async (req,res,next) =>{
    const postId = req.params.postId;
    const post = await Post.findById(postId)
    try{   
        if(!post){
            const error = new Error ('Could not find post');
            error.statusCode = 404;
            throw error;
        }  
        if(post.creator.toString()!==req.userId.toString()){
            const error = new Error ('Not Authorized');
            error.statusCode = 403;
            throw error;
        }
        //check login user.
        clearImage(post.imageUrl);
        const removedPost = await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        const userResult = await user.save();
        res.status(200).json({
            message: `Post Deleted`,
            post: userResult
        })
    }
    catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
}

//simple function to delete a file 
const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath, err=>console.log(err))
}