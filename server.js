const express=require('express');
const helmet=require('helmet');
const cors=require('cors');
const app=express();
const PORT=3000||process.env.PORT;
require('./db.js')
const userRouter=require('./routes/userRoute.js');
app.use(express.json())
app.use('/user',userRouter)
app.use(cors());
app.use(helmet());



app.get('/',(req,res)=>{
    res.send('Hello world')
})

app.listen(PORT,()=>{
    return console.log(`server is running on port : ${PORT}`)
})
