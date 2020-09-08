//requiring datamodels into middlewares
var campgrounds=require("../models/campgrounds");
var Comment=require("../models/comments")
//defining middleware objects
var middlewaresobj={};
//to check whether the user is logged in or not
middlewaresobj.isloggedin = function (req,res,next)
    {
        if(req.isAuthenticated())
        {
            return next();
        }
        //this doesnt display anything it only stores the message to be displayed afterwords
        req.flash("error","You need to be logged in to do that");
        res.redirect("/login");
    
    }
//to check whether the campground belongs to the user or not]
middlewaresobj.checkcampgroundownership = function(req,res,next){
        if(req.isAuthenticated())
        {
            campgrounds.findById(req.params.id,function(err,foundcamp){
                if(err || !foundcamp)
                {
                    req.flash("error","campground not found!!!")
                    console.log("campground not found while editing");
                    res.redirect("/campground")
                }
                else
                {
                    console.log(req.user._id)
                    console.log(foundcamp.userauthor._id)
                    if(foundcamp.userauthor._id.equals(req.user._id) || req.user.isAdmin)
                    {
                        next();
                    }
                    else
                    {
                        req.flash("error","you are not authorized to do that!")
                        res.redirect("/campground/"+req.params.id)
    
                    }
                    
                }
            })
        }
        else{
            req.flash("error","You need to be logged in first!")
            res.redirect("/login")
        }
    }
//checking the owner of the comment
middlewaresobj.checkcommentownership=function(req,res,next){
    //isauthenticated checks if any usr is logged in or not
     if(req.isAuthenticated())
     {
         Comment.findById(req.params.comment_id,function(err,foundcomment){
             if(err || !foundcomment)
             {
                 req.flash("error","comment not found");
                 console.log("comment not found while editing");
                 res.redirect("/campground"+req.params.id)
             }
             else
             {
                 console.log(req.user._id)
                 console.log(foundcomment.author._id)
                 if(foundcomment.author._id.equals(req.user._id) || req.user.isAdmin)
                 {
                     next();
                 }
                 else
                 {
                     req.flash("error","You are not authorized to do that!")
                     res.redirect("/campground/"+req.params.id)
 
                 }
                 
             }
         })
     }
     else{
        req.flash("error","you need to be logged in first!")
         res.redirect("/login")
     }
 }
//exporting middleware object
module.exports=middlewaresobj;
