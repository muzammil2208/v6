const mongoose=require("mongoose");
const user = require("./user");
//defining user schema
var userschema=new mongoose.Schema({
    
    username:String,
    email:String,
    password:String,
   
})

//defining commentschema
var commentschema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    text:String,
    username:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
        
       
    }
    
});
//defining schema
var campgroundschema=new mongoose.Schema({
    
    name:String,
    price:String,
    image:String,
    imageId:String,
    description:String,
    location:String,
    lat:Number,
    lng:Number,
    createdAt:{type:Date,default:Date.now},
    userauthor:
    {
        _id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
         },
         username:String
    },
    comments:[{
        _id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"comments"
        },
        text:String,
        username:String,
        createdAt:{type:Date,default:Date.now},
        author:{
            _id:{ type:mongoose.Schema.Types.ObjectId,
                ref:"user"}
           
        }

    }]
})

// returning the model 
module.exports=mongoose.model("campgrounds",campgroundschema);