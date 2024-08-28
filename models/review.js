const { default: mongoose } = require("mongoose");


const ReviewSchema=new mongoose.Schema({
    review:{
        required:true,
        type:String
    },
    userId:{
        required:true,
        type:mongoose.Types.ObjectId,
        ref:"User"
    }

})

module.exports=ReviewSchema