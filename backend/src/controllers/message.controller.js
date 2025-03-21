import mongoose from "mongoose";
import AsyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import jwt from 'jsonwebtoken'



async function getUserDataFromRequest(req){
    return new Promise((resolve , reject)=>{
         const token = req.cookies?.token
            if(token){
        
                jwt.verify(token , process.env.JWT_SECRET ,{} , (err , decoded)=>{
                    if(err){
                        throw new Error(401, "Unauthorized")
                    }
                    resolve(decoded)
                })
            }else{
               reject('no token found')
            }
    })
}


const getOldMessages = AsyncHandler(async (req , res)=>{
    const {userId} = req.params
    const userData = await getUserDataFromRequest(req)
    const ourUserId = userData.userId

   const messages = await  Message.find({
        sender : {$in:[userId , ourUserId]},
        recipient : {$in:[userId , ourUserId]},
    }).sort({createdAt: 1})
    res.json(messages)

})


export { getOldMessages}