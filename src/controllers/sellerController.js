const asyncHandler=require("../utils/asynchandler.js")

const registerSeller=asyncHandler(async(req,res)=>{
   res.status(200).json({
    message:'OK'
   })
})

module.exports={registerSeller}
