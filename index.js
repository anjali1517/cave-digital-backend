const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

app.get('/',(req,res) => {
    res.json({message: "hello from server"})
})

const authRouter = require('./routers/authRouter');
const tasksRouter = require('./routers/tasksRouter');

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

mongoose.connect(process.env.MONGO_URL, {useNewUrlParse: true, useUnifiedTopology: true,} ).then(() => {
    console.log("Database connection fullfilled")
}).catch((err) => {
    console.log(err)
})

app.use('/api/auth', authRouter)
app.use('/api',tasksRouter)

app.listen(process.env.PORT, () => {
    console.log("listening...")
})