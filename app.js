const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');


const userRouter = require("./src/routes/userRoute.js");
const homeRouter = require("./src/routes/homeRoute.js");
const productRouter = require("./src/routes/productRoute.js");
const sellerRouter=require("./src/routes/sellerRoute.js");
const orderRouter=require("./src/routes/orderRoute.js")
const errorHandler = require("./src/middlewares/errorhandler.js");

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser())
app.use(helmet());
const allowedOrigins = ["http://localhost:3000", "https://artstoreonline.vercel.app/"];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use("/", homeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller",sellerRouter)
app.use("/api/v1/products",productRouter);
app.use("/api/v1/order",orderRouter)


app.use(errorHandler);

module.exports=app;