var express=require("express");
var router=express.Router();
var passport=require("passport");
var user=require("../models/user");
var campgrounds=require("../models/campgrounds")

//to pass current user to each and every ejs template
router.use(function(req,res,next){
    res.locals.currentuser=req.user;
    next();
})
 
//routing ----------------------------------------------------------------------------------------------------
router.get("/",function(req,res){
    res.render("landing",{currentuser:req.user})
})



//================authentication routes================================================================
router.get("/register",function(req,res){
    res.render("user/register");
});

router.post("/register",function(req,res){
    var users=new user({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        avatar:req.body.avatar,
        email:req.body.email,  
        username:req.body.username,
    });
    if(req.body.admincode==="admincode"){
        users.isAdmin=true;
    }
    user.register(users,req.body.password,function(err,user)
    {
        if(err)
        {
            req.flash("error","You have been already registered!")
            console.log(err)
             res.redirect('/register')
        }
        passport.authenticate("local")(req,res,function()
        {
            console.log(user)
            req.flash("success","Welcome to Campme "+req.body.username)
            res.redirect('/campground')
        })

        
    })
})
//login route
router.get("/login",function(req,res){
    res.render("user/login",{currentuser:req.user})
})
router.post("/login",passport.authenticate("local",{

    successRedirect:"/campground",
    failureRedirect:"/login"
}),function(req,res){

})

//logout routes
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","you have been logged out");
    res.redirect("/campground")
})

//user profile rotes
router.get("/users/:id",function(req,res){
   user.findById(req.params.id).populate(user.campgrounds).exec(function(err,founduser){
       if(err){
           req.flash("error","error while finding the user")
           res.redirect("/campground")
       }
       else
       {

      console.log(founduser)
        res.render("user/show",{user:founduser})
       
        
       }

   }) 
})

module.exports=router;