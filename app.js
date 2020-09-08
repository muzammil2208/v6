//installing dotenv
require("dotenv").config()
//installing express
var express=require("express");
var app=express();

//installing path 
var path=require("path")


//installing body parser
var bodyparser=require("body-parser");
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({ extended: true }))


//installing mogoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Campmev6', {useNewUrlParser: true, useUnifiedTopology: true});

//installing methode override
var methodoveride=require("method-override");
app.use(methodoveride("_method"));

//initialing express session
var session=require("express-session");
app.use(session({
    secret:"Allah is one",
    resave:false,
    saveUninitialized:false
}))

//installing moment js for time since feature
app.locals.moment=require("moment");

// installing flash messages
var flash=require("connect-flash");
app.use(flash());

//sending essential data to every ejs files
app.use(function(req,res,next){
    res.locals.currentuser=req.user;
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success")
   
    next();
})
//requiring routes fiels

var   indexroutes     =require("./routes/index"); 
    commentroutes   =require("./routes/comment"),
    campgroundroutes=require("./routes/campground");
  




//importing seed db function

const seedDB = require("./seed");
//importind database schemas
var campgrounds=require("./models/campgrounds")
var comments=require("./models/comments")
var user=require("./models/user")

//installing passport, passportlocal  and express session
var passport=require("passport");
var localstrategy=require("passport-local");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
// seedDB();

//setting public directory
app.use(express.static("public"));





// useing routes files==================================================================
app.use(indexroutes);
app.use(campgroundroutes);
app.use(commentroutes);

``

//listening=------============-----================================================================================================================================
app.listen("2",function(){
    console.log("server is listening at port 2")
})