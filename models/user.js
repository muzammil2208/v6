var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
//user schema
var userschema=new mongoose.Schema({
    firstname:String,
    lastname:String,
    avatar:String,
    email:String,
    username:String,
    password:String,
    isAdmin:{type:Boolean, default:false},
    campgrounds:[{
        _id:String,
        name:String,
        image:String
    }]
   
})

userschema.plugin(passportlocalmongoose);

module.exports=mongoose.model("user",userschema);