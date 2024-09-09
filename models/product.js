const mongoose=require("mongoose");
const RatingSchema = require("./rating");
const ReviewSchema = require("./review")

const productSchema=new mongoose.Schema({
    title:{
        required:true,
        type:String
    },
    imageUrl:String,
    description:String,
    category:{
        required:true,
        type:String,
        enum:["MADHUBANI","PHAD","WARLI","MINIATURE"]
    },
    artist:{
        required:true,
        type:String,
    },
    price:Number,
    discount:{
        default:0,
        type:Number
    },
    ratings:[RatingSchema],
    reviews:[ReviewSchema]
},{timestamps:true});

const Product = mongoose.model("Product",productSchema)
module.exports=Product;