const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDb() {
  try {
    const connectionResponse=await mongoose.connect(MONGODB_URI);
    console.log(`Connected to Database || DB HOST : ${connectionResponse.connection.host}`);
  } catch (error) {
    console.log("Mongodb connection error",error);
    process.exit(1);
  }
}

module.exports = connectDb;