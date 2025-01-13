const bcrypt = require('bcrypt');
const SALT_ROUNDS=10;
async function generateHash(password){
   
    const hash = await bcrypt.hash(password,SALT_ROUNDS);
    return hash;
  
}

async function comparePassword(hash,password){
    const result = await bcrypt.compare(password,hash);
    return result;            //hash:password from db
}

module.exports={generateHash,comparePassword}

