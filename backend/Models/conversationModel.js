const mongoose  = require("mongoose");
const {Schema}=mongoose;

const conversationSchema=new Schema({

    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],

    messages:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Message",
            default:[]
        }
    ],

    unreadMessages:{
        type: Object,
        
    },

    groupName:{
        type:String
    }
    
    
    
},{timestamps:true})

const Conversation= mongoose.model("Conversation",conversationSchema)

module.exports=Conversation