var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

//installing multer and cloudinary
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'camp-me', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



var geocoder = NodeGeocoder(options);
var express=require("express");
var router=express.Router();
//installing various middlewares
var middleware=require("../middlewares");
// importing essential models
var campgrounds=require("../models/campgrounds");
var user=require("../models/user")



 
router.get("/campground",function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        campgrounds.find({name:regex},function(err,allcampgrounds){
            if(err)
            {
                req.flash("error","something went wrong....")
                console.log("campgronds not found")
                res.redirect("/")
            }
            else{
                if(allcampgrounds.length>=1)
                {
                    res.render("campgrounds/index",{campgrounds:allcampgrounds, currentuser:req.user})
                }
                else
                {
                    req.flash("error","No campgrounds match the search Query")
                    res.redirect("/campground")
                }
               
            }
        })
    }
    else
    {
    //geting all campgrounds form the database
    campgrounds.find({},function(err,allcampgrounds){
        if(err)
        {
            req.flash("error","something went wrong....")
            console.log("campgronds not found")
            res.redirect("/")
        }
        else{
            res.render("campgrounds/index",{campgrounds:allcampgrounds, currentuser:req.user})
        }
    })
}
    // res.render("campground",{campgrounds:campgrounds})
})
router.get("/campground/new",middleware.isloggedin,function(req,res){
    res.render("campgrounds/new")
})
//CREATE - add new campground to DB
router.post("/campground", middleware.isloggedin, upload.single('image'), function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    
    var desc = req.body.description;
    var price=req.body.price;
    var author = {
        _id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        req.flash('error',"Invalid address!");
        console.log(err)
        return res.redirect('back');
      }
      cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
            req.body.image = result.secure_url;
            req.body.imageId=result.public_id;
            var image=req.body.image;
            var imageId=req.body.imageId;
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name,price:price, image: image,imageId: imageId, description: desc,location: location, lat: lat, lng: lng, userauthor:author};
        // Create a new campground and save to DB
        campgrounds.create(newCampground, function(err, newlyCreated){
            if(err||!newlyCreated){
                req.flash("error","error while creating a new campground")
                console.log(err);
                res.redirect("/campground")
            } else {
                //redirect back to campgrounds page
                req.flash("success","successfully added a campground")
                console.log(newlyCreated);
                user.findById(newlyCreated.userauthor._id,function(err,userfound){
                    if(err){
                        console.log("error while finding the user")
                    }
                    else
                    {
                        userfound.campgrounds.push({_id:newlyCreated._id,
                            name:newlyCreated.name,
                            image:newlyCreated.image})
                    }
                    userfound.save();
                    console.log(userfound)
                    
                })
                res.redirect("/campground");
            }
        });
        });
    });
});
//show more info about particular campground
router.get("/campground/:id",function(req,res){
    campgrounds.findByIdAndUpdate(req.params.id).populate("campgrounds.comments","campgrounds.userauthor").exec(function(err, foundcampground){
        if(err || !foundcampground)
        {
            req.flash("error","error while finding the campground in the database!")
            console.log(err)
            res.redirect("/campground")
        }
        else
        {
            console.log(foundcampground)
            res.render("campgrounds/show",{campgrounds:foundcampground})
        }
    })
})

//edit campground rote
router.get("/campground/:id/edit",middleware.checkcampgroundownership,function(req,res){
    //if user is logged in then allow to edit 
    campgrounds.findById(req.params.id,function(err,foundcamp){
        if(err ||!foundcamp)
        {
            req.flash("error","error while finding the campground to edit!")
            console.log("eroor while findiing the campground")
            res.redirect("/campground"+req.params.id)
        }
        else
        {
            res.render("campgrounds/edit",{campground:foundcamp})
        }
        
    });
    
   
    
})
//update campground route
// UPDATE CAMPGROUND ROUTE
router.put("/campground/:id", middleware.checkcampgroundownership,upload.single('image'), function(req, res){
    geocoder.geocode(req.body.location, function (err,data) {
        if (err || !data.length) {
            req.flash('error',"Invalid address!");
            console.log(err)
            return res.redirect('back');
          }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.location = data[0].formattedAddress;
     
  
      campgrounds.findByIdAndUpdate(req.params.id, req.body.campground, async function(err, campground){
          if(err||!campground){
              req.flash("error", err.message);
              res.redirect("back");
          } else 
          {
           
            if(req.file)
            {

            
                    try {
                         await cloudinary.uploader.destroy(campground.imageId);
                        var result = await cloudinary.uploader.upload(req.file.path);
                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;
                        campground.location=req.body.location;
                    } catch(err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
            }
        
              campground.save();
              req.flash("success","Successfully Updated!");
              res.redirect("/campground/" + campground._id);
          }
      });
    });
  });

//Delete route
router.delete("/campground/:id",middleware.checkcampgroundownership,function(req,res){
    campgrounds.findByIdAndDelete(req.params.id,function(err,deletedcamp){
        if(err || !deletedcamp)
        {
            req.flash("error","error while finding the campground to delete!")
            console.log("error while deleteing campground");
            res.redirect("/campground")
        }
        else
        {
            user.findById(deletedcamp.userauthor._id,function(err,deletinguser){
                if(err){
                    req.flash("error","error while deleting the entry from the user model");
                    res.redirect("/campground/"+req.params.id)
                }
                else{
                    console.log(deletinguser)
                    deletinguser.campgrounds.forEach(function(campground){
                        if(deletedcamp._id.equals(deletedcamp._id))
                        {
                            deletinguser.campgrounds.remove(campground)
                        }
                    });
                    deletinguser.save()
                }
                
            })
            
            req.flash("success","Campground is deleted!")
            console.log("campground deleted")
            console.log(deletedcamp)
            res.redirect('/campground')
        }
    })
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports=router;