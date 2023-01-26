require("dotenv").config();

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {body,validationResult} = require('express-validator');
const bcrypt = require("bcryptjs");
const Account = require('../models/Accounts');
var JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {}
opts.secretOrKey = "SECRETPASSWORD";
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();


router.get('/',(req, res, next)=>{
    res.render('index');
});


//Login
router.get('/login',(req,res,next)=>{
    res.render('login');
})

router.post('/login',(req,res,next)=>{
    Account.findOne({email: req.body.email},(err,account)=>{
        if(err) throw err;
        if(!account) return res.status(403).json({message: 'Password incorrect'});
    
        bcrypt.compare(req.body.password,account.password,(err,success)=>{
            if(err) throw err;
            if(!success) return res.json({message: 'Password incorrect'});

            const jwtPayload = {
                email: account.email
            }
            jwt.sign(
                jwtPayload,
                process.env.SECRET,
                {
                    expiresIn: 120
                },
                (err,token)=>{
                    if(err) throw err;
                    return res.json({success: token})
                }
            )
        })
    })
})


//Register
router.get('/register',(req,res,next)=>{
    res.render('register');
})

router.post('/register',
    body('email').isEmail(),
    body('password').isLength({min: 5}),
    (req,res,next)=>{
        //Checking if email and password are valid
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        Account.findOne({email: req.body.email},(err,account)=>{
            if(err) throw err;
            if(account){
                //Account with email already exists
                return res.status(403).json({message: "Account with e-mail already exists"});
            }

            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err) throw err;
                const encryptedPassword = hash;
                Account.create(
                    {
                        email: req.body.email,
                        password: encryptedPassword
                    },
                    (err)=>{
                        if(err) throw err;
                        return res.json({message: 'New account created with e-mail: '+req.body.email});
                    }
                )
            });
        })
})


module.exports = router;