var express = require("express");
var router  = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware=require("../middlewares/index.js");



//Comments New
router.get("/campground/:id/comments/new",middleware.isloggedin,function(req,res){
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground){
        if(err ||!campground){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/campground/:id/comments",middleware.isloggedin,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           req.flash("error","error file finding the campground");
           res.redirect("/campground");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error","error while creating a comment")
               console.log(err);
               res.redirect("/campgrounds"+req.params.id)
           } else {
               //add username and id to comment
               comment.author._id = req.user._id;
               comment.username = req.user.username;
               console.log(comment);
               //save comment
               comment.save();
               campground.comments.push(comment)
               campground.save();
               console.log(campground)
               res.redirect('/campground/' + campground._id);
           }
        });
       }
   });
});

//edit comment in the campground
router.get("/campground/:id/comments/:comment_id/edit",middleware.checkcommentownership,function(req,res){
   Comment.findById(req.params.comment_id,function(err,foundcomment){
       if(err||!foundcomment)
       {
           req.flash("error","error while finding the comment in the campground schema")
           console.log("error while finding the comment")
           res.redirect('/campground')
       }
       else
       {
        res.render("./comments/edit",{campground_id:req.params.id, comment:foundcomment})
       }
   })
    
})
//updating comment
router.put("/campground/:id/comments/:comment_id",middleware.checkcommentownership,function(req,res){
    console.log(req.body.comment)
    //updating starts here
    Campground.findById(req.params.id,function(err,camp){
        if(err||!camp){
            req.flash("error","Error while finding the campground for updating comment")
            console.log("error while finding the campground")

        }
        else
        {
            //updating the comment in the comment schema
            Comment.findById(req.params.comment_id,function(err,editcomment){
                if(err||!editcomment){
                    req.flash("error","error while updating comment in the comment schema")
                    console.log("error while find comment")
                    res.redirect("/campground/"+req.params.id)
                }
                else
                {
                    editcomment.text=req.body.comment.text;
                    editcomment.save();
                    console.log(editcomment)
                    
                }
            });

            //updating in the comment schema in the campground schema
            console.log("insde the loop")
            camp.comments.forEach(function(comment){
                if(comment._id.equals(req.params.comment_id))
                {
                    comment.text=req.body.comment.text;
                }
                
            });
            console.log(camp.comments)
            camp.save();
            console.log("outside the loop")
            req.flash("success","Successfully edited the campground")
            res.redirect("/campground/"+req.params.id)
        }
    });
    
    
  
});
//deleting a commnetn
router.delete("/campground/:id/comments/:comment_id",middleware.checkcommentownership,function(req,res){
    Campground.findById(req.params.id,function(err,campgrounds){
        if(err||!campgrounds){
            req.flash("error","Error while finding the campground to delete");
            console.log("error while delteing the campground")
            res.redirect("/campground")
        }
        else
        { 
            //deleting fromm the commentschema
            Comment.findByIdAndDelete(req.params.comment_id,function(err,deletedcomment){
                if(err ||!deletedcomment){
                    req.flash("error","error while deleting comment")
                    console.log("error while delting the comment from the comment schema")
                    res.redirect("/campground"+req.params.id)
                }
                else
                {
                    console.log("comment deleted from the comment schema:")
                    console.log(deletedcomment)
                }
            })
            //deleting from the campground schema
            campgrounds.comments.forEach(function(comment){
                if(comment._id.equals(req.params.comment_id)){
                    campgrounds.comments.remove(comment)
                }
            });
            campgrounds.save()
            console.log(campgrounds.comments)
            req.flash("success","Successfully deleted the comment!")
            res.redirect("/campground/"+req.params.id)
        }
    })
})


module.exports = router;