const jwt=require('jsonwebtoken');
require('dotenv').config()
const MY_SECRET=process.env.SECRET_KEY;
function createToken(userId){
    const token=jwt.sign({userId},MY_SECRET);
    return token;
}
module.exports=createToken;