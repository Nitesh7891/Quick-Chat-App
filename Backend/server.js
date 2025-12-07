import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import {connectDB} from "./db/db.js"
import  userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { Server } from "socket.io"
import cookieParser from "cookie-parser";


dotenv.config(
    {
        path: './.env'
    }
);

//Create express app and server
const app=express();
const server=http.createServer(app);

//initialize socket.io server
export const io=new Server(server,{
    cors:{
        origin:process.env.CORS_ORIGIN,
    }
})

//store online users
export const userSocketMap={};

//socket.io connection handler
io.on("connection",(socket)=>{
    const userid=socket.handshake.query.userId;
    console.log("User connected with ID:", userid);
    if(userid) userSocketMap[userid]=socket.id;

    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("User disconnected with ID:", userid);
        if(userid) delete userSocketMap[userid];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    });
})


const PORT=process.env.PORT || 5000;

//middleware setup
app.use(cookieParser());
app.use(express.json({limit:'4mb'}));
app.use(cors({origin: process.env.CORS_ORIGIN,credentials:true}));
app.use(express.urlencoded({extended:true, limit:'4mb'}));

//Routes setup
app.use("/api/status",(req,res)=>res.send("Server is live"))
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)

connectDB()
.then(
    ()=>{
    server.listen(PORT,()=>{
    console.log(`Server is running on port https://localhost:${PORT}`);
   });
    }
)
.catch((err)=>console.log("DB connection error:", err));



