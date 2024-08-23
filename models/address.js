const mongoose = require('mongoose');

const addressSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:Number,
        required:true
    },
    pinCode:{
        required:true,
        type:Number
    },
    address1:{
        required:true,
        type:String
    },
    address2:{
        type:String
    },
    landmark:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    country:{
        type:String
    }
    
    
    
})
module.exports=addressSchema;