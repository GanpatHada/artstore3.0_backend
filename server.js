require("dotenv").config();
const connectDb = require("./src/config/db.config.js");
const app = require("./app");
const port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 server is running on port : ${port}`);
    });
  })
  .catch((e) => {
    console.log("Mongodb connection failed !!!" + e);
  });
