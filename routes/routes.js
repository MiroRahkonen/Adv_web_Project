require('dotenv').config();
const jwt = require('jsonwebtoken');
const validateToken = require('../authentication/validateToken');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const {check} = require('express-validator');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

const Accounts = require('../models/Accounts.js');
const Posts = require('../models/Posts.js');
const Comments = require('../models/Comments');

// Index page
router.get('/',(req,res,next)=>{
    return res.render('index');
})

//Register page
router.get('/register', (req,res,next)=>{
    if(req.user != null){
        return res.redirect('/');
    }
    res.render('register');
})

// Login page
router.get('/login',(req,res,next)=>{
    return res.render('login');
})

// Post page
router.get('/post/:postid',(req,res,next)=>{
    res.render('post');
})


// Register
//I got help with checking the password using RegEx expressions from these stackoverflow threads
//https://stackoverflow.com/questions/1559751
//https://stackoverflow.com/questions/42353753
router.post('/register',upload.none(),
    body('username').isLength({min: 4}),
    body('email').isEmail(),
    check('password')
    .isLength({min: 6})
    .matches(/\d/)      //has a number
    .matches(/[a-z]/)   //has a lowercase letter
    .matches(/[A-Z]/),   //has an uppercase letter 
    (req,res,next)=>{
        //Checking if email and password are valid
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message: "Password isn't strong enough"});
        }

        Accounts.findOne({email: req.body.email},(err,account)=>{
            if(err) throw err;
            if(account){
                //Account with email already exists
                return res.status(403).json({message: 'Account with e-mail already exists'});
            }

            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err) throw err;
                const encryptedPassword = hash;
                Accounts.create(
                    {
                        username: req.body.username,
                        email: req.body.email,
                        password: encryptedPassword
                    },
                    (err)=>{
                        if(err) throw err;
                        return res.status(200).json({message: 'Account created'});
                    }
                )
            });
        })
})


// Login
router.post('/login', upload.none(), (req,res,next)=>{
    Accounts.findOne({email: req.body.email},(err,account)=>{
        if(err) throw err;
        if(!account) return res.status(403).json({message: 'Password incorrect'});
    
        bcrypt.compare(req.body.password,account.password,(err,success)=>{
            if(err) throw err;
            if(!success) return res.status(400).json({message: 'Password incorrect'});

            const jwtPayload = {
                email: account.email,
                username: account.username
            }
            jwt.sign(
                jwtPayload,
                process.env.SECRET,
                {
                    expiresIn: 12000
                },
                (err,token)=>{
                    if(err) throw err;
                    return res.json({success: true, token})
                }
            )
        })
    })
})


// Creating a post
router.post('/post',validateToken,(req,res,next)=>{
    Posts.create(
        {
            username: req.user.username,
            email: req.user.email,
            title: req.body.title,
            message: req.body.message,
            code: req.body.code
        },
        (err,post)=>{
            if(err) throw err;
            return res.json(post);
        }
    )
})

//Editing a post
router.put('/post',(req,res,next)=>{
    Posts.findOne({_id: req.body.postID},(err,post)=>{
        if(err) throw err;
        post.title = req.body.title;
        post.message = req.body.message;
        post.code = req.body.code;
        post.save();
    })
    res.json('Changes saved');
})

//Deleting a post and all its comments
router.delete('/post',(req,res,next)=>{
    Posts.deleteOne({_id: req.body.postID},(err)=>{
        if(err) return res.status(400).json('Error deleting post');
    })

    Comments.deleteMany({postID: req.body.postID},(err)=>{
        if(err) return res.status(400).json('Error deleting comments');
    })
    return res.json('Post and comments deleted');
})


//Creating a comment
router.post('/comment',validateToken,(req,res,next)=>{
    Comments.create(
        {
            postID: req.body.postID,
            username: req.body.username,
            message: req.body.message,
            code: req.body.code,
            upvotes: 0
        },
        (err)=>{
            if(err) throw err;
            return res.status(200).json({message: 'Post created'});
        }
    )
})

//Editing a comment
router.put('/comment',(req,res,next)=>{
    Comments.findOne({_id: req.body.commentID},(err,comment)=>{
        if(err) throw err;
        comment.message = req.body.message;
        comment.code = req.body.code;
        comment.save();
    })
    res.json('Changes saved');
})

router.put('/votecomment',(req,res,next)=>{
    Comments.findOne({_id: req.body.commentID},(err,comment)=>{
        if(err) res.status(400).json('Upvote failed.');
        
        if(req.body.upvote === 1){
            comment.upvotes += 1;
            comment.upvoters.push(req.body.username);
        }
        else if(req.body.upvote === -1){
            comment.upvotes += -1;
            const index = comment.upvoters.indexOf(req.body.username);
            comment.upvoters.splice(index,1);
        }
        comment.save();
    })
    res.json('Upvote saved');
})

//Deleting a comment
router.delete('/comment',(req,res,next)=>{
    Comments.deleteOne({_id: req.body.commentID},(err)=>{
        if(err) return res.status(400).json('Error deleting comment');
    })
    return res.json('Comment deleted');
})


// Functions
router.get('/account', validateToken, (req,res,next)=>{
    res.json(req.user);
})

router.get('/posts',(req,res,next)=>{
    Posts.find({},(err,posts)=>{
        if(err) return next(err);
        res.json(posts);
    })
})

router.get('/getpost/:postid',(req,res,next)=>{
    Posts.findOne({_id: req.params.postid},(err,post)=>{
        if(err) throw err;
        res.json(post);
    })
})

router.get('/comments/:postid',(req,res,next)=>{
    Comments.find({postID: req.params.postid},(err,comments)=>{
        if(err) throw err;
        res.json(comments);
    })
})





module.exports = router;