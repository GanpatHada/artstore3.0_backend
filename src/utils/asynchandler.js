function asyncHandler(func) {
  return (req,res,next)=>{
    Promise.resolve(func(req,res,next)).catch((error)=>next(error))
  }
}
module.exports = asyncHandler;
