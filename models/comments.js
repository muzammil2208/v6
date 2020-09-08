var mongoose=require("mongoose");
//comments schema
var commentschema = new mongoose.Schema({
    text:String,
    username:String,
    createdAt:{type:Date,default:Date.now},
    author:{
        _id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
        
    }
});
//
module.exports = mongoose.model("comments",commentschema)