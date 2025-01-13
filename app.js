const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();

const userRouter = require("./src/routes/userRoute.js");
const homeRouter = require("./src/routes/homeRoute.js");
const productRouter = require("./src/routes/productRoute.js");
const paymentRouter = require("./src/routes/PaymentRoute.js");

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api/v1", homeRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products",productRouter);
app.use("/api/v1/payment",paymentRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

module.exports=app;