const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser')


const userRouter = require("./src/routes/userRoute.js");
const homeRouter = require("./src/routes/homeRoute.js");
const productRouter = require("./src/routes/productRoute.js");
const paymentRouter = require("./src/routes/PaymentRoute.js");
const sellerRouter=require("./src/routes/sellerRoute.js")

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser())
app.use(helmet());
app.use(cors());

app.use("/api/v1", homeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller",sellerRouter)
app.use("/api/v1/products",productRouter);
app.use("/api/v1/payment",paymentRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

module.exports=app;