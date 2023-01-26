var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

router.get('/',(req, res, next)=>{
    res.render('index');
});


//Login
router.get('/login',(req,res,next)=>{
    res.render('login');
})



//Register
router.get('/register',(req,res,next)=>{
    res.render('register');
})

module.exports = router;