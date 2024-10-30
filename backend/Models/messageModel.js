const mongoose  = require("mongoose");
const {Schema}=mongoose;

const messageSchema=new Schema({

    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    receiverId:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"User",
        required:true
    },

    message:{
        type: String,
        required:true,
        
    }

    
},{timestamps:true})

const Message= mongoose.model("Message",messageSchema)

module.exports=Message