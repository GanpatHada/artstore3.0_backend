const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asynchandler");
const jwt=require('jsonwebtoken')

const verifyJwt=asyncHandler(async(req,_,next)=>{
  try {
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token)
    {
      throw new ApiError(401,"unauthorized access")
    }
    const decodedJwt= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    req._id=decodedJwt._id;
    next();
  } catch (error) {
    console.log(error)
    throw new ApiError(401,"Invalid access token")
  }
})

module.exports=verifyJwt
