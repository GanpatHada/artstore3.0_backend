const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
require("./db.js");
const PORT = 8000 || process.env.PORT;

const userRouter = require("./routes/userRoute.js");
const homeRouter = require("./routes/homeRoute.js");

app.use(helmet());
app.use(express.json());

app.use(cors());
app.use("/", homeRouter);
app.use("/user", userRouter);

app.listen(PORT, () => {
  return console.log(`server is running on port : ${PORT}`);
});
