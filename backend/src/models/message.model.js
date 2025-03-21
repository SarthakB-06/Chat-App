// import mongoose from "mongoose";
import mongoose, {model , Schema} from 'mongoose'


const messageSchema = new Schema({
    sender:{
        type :mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    recipient:{
        type :mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    text:{
        type:String,
    } ,
    file:{
        type:String,
        
    }
},{timestamps:true})



export const Message = model('Message' , messageSchema)