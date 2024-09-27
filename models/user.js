const mongoose=require('mongoose');
const { addressSchema } = require('./address');


const userSchema=new mongoose.Schema({
    userName:{
        required:true,
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    addresses:[addressSchema],
    cart:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Product"
        }
    ],
    wishlist:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Product"
        }
    ]

})

const User=mongoose.model('User',userSchema);
module.exports=User