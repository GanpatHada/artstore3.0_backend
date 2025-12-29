const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

// Routers
const authRouter = require('./src/routes/authRoute.js');
const userRouter = require('./src/routes/userRoute.js');
const cartRouter = require('./src/routes/cartRoute.js');
const wishlistRouter = require('./src/routes/wishlistRoute.js');
const addressRouter = require('./src/routes/addressRoute.js');
const homeRouter = require('./src/routes/homeRoute.js');
const productRouter = require('./src/routes/productRoute.js');
const sellerRouter = require('./src/routes/sellerRoute.js');
const storeRouter = require('./src/routes/storeRoute.js');
const orderRouter = require('./src/routes/orderRoute.js');

const errorHandler = require('./src/middlewares/errorhandler.js');
const { allowedOrigins } = require('./src/Constants.js');

const app = express();

// ========== Middlewares ==========

app.use(helmet());
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Static files
app.use(express.static('public'));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xssClean());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// CORS

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// ========== Routes ==========

app.use('/', homeRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/user/cart', cartRouter);
app.use('/api/v1/user/wishlists', wishlistRouter);
app.use('/api/v1/user/address', addressRouter);
app.use('/api/v1/seller', sellerRouter);
app.use('/api/v1/seller/store', storeRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/order', orderRouter);

app.use(errorHandler);

module.exports = app;
