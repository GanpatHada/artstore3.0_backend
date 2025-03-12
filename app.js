const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');
const isProduction = process.env.NODE_ENV === 'production';



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
app.use(cors({
    origin: isProduction ? 'https://artstore3-0-backend-1.onrender.com' : 'http://localhost:3000', 
    credentials: true,  
  }));

app.use("/", homeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller",sellerRouter)
app.use("/api/v1/products",productRouter);
app.use("/api/v1/order",orderRouter)


app.use(errorHandler);

module.exports=app;