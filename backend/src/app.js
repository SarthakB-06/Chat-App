import express from 'express';
const app = new express()
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    credentials:true,
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use('/uploads' ,express.static(__dirname + '/uploads' ))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "50mb" }));



import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";


app.use("/api/messages" ,messageRouter)
app.use("/api/users" , userRouter); 




export default app

// arkvbFYlHkTizhhL