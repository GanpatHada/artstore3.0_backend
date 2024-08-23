const mongoose=require('mongoose');
const addressSchema = require('./address');

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
    addresses:[addressSchema]
})

const User=mongoose.model('User',userSchema);
module.exports=User