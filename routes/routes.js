require('dotenv').config();
const jwt = require('jsonwebtoken');
const validateToken = require('../authentication/validateToken.js');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');
const {check} = require('express-validator');
const passport = require('passport');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});
const session = require('express-session');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.secretOrKey = 'SECRETPASSWORD';
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
const Accounts = require('../models/Accounts.js');
const Posts = require('../models/Posts.js');

//Session setup
/*router.use(session({
    secret: 'SECRETPASSWORD',
    resave: false,
    saveUninitialized: true
}))
router.use(passport.initialize());
router.use(passport.session());

passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    Accounts.findOne({email: jwt_payload.email},(err,account)=>{
        if(err) return done(err,false);     //There was an error
        if(account) return done(null,account);    //Account found, return account
        else return done(null,false);       //Account not found, return false
    })
}))*/




//Register
router.get('/register',checkIfLoggedIn,(req,res,next)=>{
    res.render('register');
})

//I got help with checking the password using RegEx expressions from these stackoverflow threads
//https://stackoverflow.com/questions/1559751
//https://stackoverflow.com/questions/42353753
router.post('/register',upload.none(),
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
            console.log(errors)
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
                        email: req.body.email,
                        password: encryptedPassword
                    },
                    (err)=>{
                        if(err) throw err;
                        console.log('Account created');
                        return res.status(200).json({message: 'Account created'});
                    }
                )
            });
        })
})

//  Login
router.get('/login',checkIfLoggedIn,(req,res,next)=>{
    return res.render('login');
})

router.post('/login', upload.none(), (req,res,next)=>{
    Accounts.findOne({email: req.body.email},(err,account)=>{
        if(err) throw err;
        if(!account) return res.status(403).json({message: 'Password incorrect'});
    
        bcrypt.compare(req.body.password,account.password,(err,success)=>{
            if(err) throw err;
            if(!success) return res.status(400).json({message: 'Password incorrect'});

            const jwtPayload = {
                email: account.email
            }
            jwt.sign(
                jwtPayload,
                process.env.SECRET,
                {
                    expiresIn: 1200
                },
                (err,token)=>{
                    if(err) throw err;
                    return res.json({success: true, token})
                }
            )
        })
    })
})

// Index page
router.get('/',(req,res,next)=>{
    return res.render('index');
})

//Functions
function checkIfLoggedIn(req,res,next){
    //const authToken = localStorage.getItem('auth_token');
    //console.log(authToken);
    next();
}

router.post('/makepost',validateToken,(req,res,next)=>{
    console.log(req.body);
    Posts.create(
        {
            email: req.body.email,
            title: req.body.title,
            message: req.body.message
        },
        (err)=>{
            if(err) throw err;
            console.log('Post created');
            return res.status(200).json({message: 'Post created'});
        }
    )
})

router.get('/getaccount', validateToken, (req,res,next)=>{
    console.log(req.user);
    res.json(req.user);
})

module.exports = router;