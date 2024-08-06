const express=require('express');
const { createUser } = require('./controllers/userController.js');
const app=express();
app.use(express.json())
const PORT=3000||process.env.port;
require('./db.js')
const userRouter=require('./routes/userRoute.js');
app.use('/user',userRouter)
app.get('/',(req,res)=>{
    res.send('Hello world')
})



app.listen(PORT,()=>{
    return console.log(`server is running on port : ${PORT}`)
})
