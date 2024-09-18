const mongoose = require("mongoose");

const OrderDetailsSchema = new mongoose.Schema({
  userId:{
    required:true,
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  productId: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },

  
});
 
const OrderDetails=mongoose.model("OrderDetails",OrderDetailsSchema);
module.exports=OrderDetails;