import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import AsyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'




// registering the user
const registerUser = AsyncHandler(async (req , res)=>{
    const {username , password} = req.body
    const hashedPassword  = bcrypt.hashSync(password , 10)
    const user = await User.create({
        username:username,
        password:hashedPassword
    })
    jwt.sign({UserId:user._id , username} , process.env.JWT_SECRET , {} , (err , token)=>{
        if(err){
            throw new Error(500, err)
        }
        res.cookie("token" , token ,{sameSite:'none' , secure:true}).status(201).json({
            id:user._id,
            
        })
    })
})



// getting the user profile
const userProfile = AsyncHandler(async (req,res)=>{
    const token = req.cookies?.token
    if(token){

        jwt.verify(token , process.env.JWT_SECRET ,{} , (err , decoded)=>{
            if(err){
                throw new Error(401, "Unauthorized")
            }
            res.status(200).json(decoded)
        })
    }else{
        throw new Error(401, "no token found")
    }
})
 

const userLogin = AsyncHandler(async (req,res)=>{
    const {username , password} = req.body
    const user = await User.findOne({username})
    if(!user){
        throw new Error(401, "No user found")
    }
    const isMatch = bcrypt.compareSync(password, user.password)
    if(!isMatch){
        throw new Error(401, "Invalid password")
        alert("Invalid password")
    }
    jwt.sign({userId:user._id , username} , process.env.JWT_SECRET , {} , (err, token)=>{
        res.cookie("token" , token , {sameSite:'none' , secure:true}).json({
            id : user._id
        })
    })


})

const getOfflineUser = AsyncHandler(async (req,res)=>{
    const users = await User.find({} ,{'_id':1 ,username:1})
    res.json(users)
})

const userLogOut = AsyncHandler(async (req,res)=>{
    res.cookie('token' , '', {sameSite:'none' , secure:true}  ).json('ok')
})



export { registerUser, userProfile  ,userLogin , getOfflineUser , userLogOut}