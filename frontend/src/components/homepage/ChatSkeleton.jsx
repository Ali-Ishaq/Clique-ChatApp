import React, { useRef, useEffect, useContext } from "react";
import { FaArrowUp } from "react-icons/fa6";
import './Homepage.css'
import { socketContext } from "../../context/socketContext";
import { IoArrowBackOutline } from "react-icons/io5";
import "./ChatSkeleton.css"

const messages =[
  {
    isSent:false,
    message: "Lorem ipsum dolor sit"
  },{
    isSent:true,
    message:"Lorem amet consectetur adipisicing  delectus corporis  consectetur? Ut voluptas quis magni?"
  },{
    isSent:false,
    message: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus, sapiente."
  },{
    isSent:true,
    message: "Lorem ipsum dolor sit amet."
  },{
    isSent:false,
    message: "Lorem ipsum dolor sit amet."
  },{
    isSent:true,
    message: "Lorem ipsum sit amet."
  },{
    isSent:true,
    message: "Lorem ipsum ipsum dolor sit amet."
  },{
    isSent:false,
    message: "Lorem ipsum dolor dolor sit amet."
  },
]

function ChatSkeleton({selectedCard,mobileHorizontalScroll}) {
  return (
    <div className="chats-container">
    <div className="chat-container-title-sec">
    <IoArrowBackOutline className="back-arrow" color="white" size={'20px'} style={{display:'none'}} onClick={()=>mobileHorizontalScroll(-1)}/>
      <div className="pfp-por">
        <img src="pfp.jpg" alt="" />
      </div>
      <div className="username-por">
        <p>{selectedCard.username}</p>
      </div>
      <div className="navigation-por"></div>
    </div>
    <div className="chat-container-chat-sec" >
      {messages &&
        messages.map((value, index) => (
          <p key={index} className={`chat-msg-skeleton ${value.isSent ? "sent-chat-msg-skeleton" : "received-chat-msg-skeleton"}`}>
            {value.message}

            
          </p>
        ))}
    </div>
    <form className="chat-container-send-msg-sec" /*onSubmit={(e)=>handleSendMsgFormSubmit(e,new Date().toString())} */>
      <input
        id="send-msg-input"
        type="text"
        placeholder="Type a message"
        // value={sendMsgField}
        // onChange={handleSendMsgFieldChange}
      />
      <button id="send-msg-btn" type="submit">
        <FaArrowUp />
      </button>
    </form>
  </div>
  )
}

export default ChatSkeleton