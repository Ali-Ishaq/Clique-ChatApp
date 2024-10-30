// Chat.jsx
import React, { useRef, useEffect, useContext } from "react";
import { FaArrowUp } from "react-icons/fa6";
import './Homepage.css'
import { socketContext } from "../../context/socketContext";
import { IoArrowBackOutline } from "react-icons/io5";
import { TbDotsVertical } from "react-icons/tb";


function Chat({ messages,setMessages, handleSendMsgFormSubmit, sendMsgField, handleSendMsgFieldChange,selectedCard,mobileHorizontalScroll,onlineUsers }) {
  const chatContainerRef = useRef(null);
  const{liveMessage}=useContext(socketContext)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    }, [messages]);
    
  const getMessageTime=(msgDate)=>{

    const date=new Date(msgDate)
    return `${date.getHours()}:${date.getMinutes()}`

  }
    

  return (
    <div className="chats-container">
      <div className="chat-container-title-sec">
      <IoArrowBackOutline className="back-arrow" color="white" size={'20px'} style={{display:'none'}} onClick={()=>mobileHorizontalScroll(-1)}/>
        <div className="pfp-por">
          <img src="pfp.jpg" alt="" />
          <span className="active-user-dot"  style={onlineUsers.includes(selectedCard.userId) ? {} : { display: "none" }}></span>
        </div>
        <div className="username-por">
          <p>{selectedCard.conversationName}</p>
        </div>
        <div className="navigation-por">
        <TbDotsVertical/>
        </div>
      </div>
      <div className="chat-container-chat-sec" ref={chatContainerRef}>
        {messages &&
          messages.map((value, index) => {

           return !(selectedCard.isGroupConversation)?
           
           (<p key={index} className={`chat-msg ${value.isSent ? "sent-chat-msg" : "received-chat-msg"}`}>
                {value.message}
                <p className="msg-time-stamp">{getMessageTime(value.createdAt)}</p>
            </p>):
  
            (<div className={`chat-msg chat-msg-groupchat ${value.isSent ? "sent-chat-msg" : "received-chat-msg"}`} >
            
              <div className="user-and-msg">
                {!value.isSent&&<p className="sender-username">{value.senderId.username}</p>}
                <p>{value.message}</p>

              </div>
              <p className="msg-time-stamp">{getMessageTime(value.createdAt)}</p>
            </div>)


          }

           
          
          )}
      </div>
      <form className="chat-container-send-msg-sec" onSubmit={(e)=>handleSendMsgFormSubmit(e,new Date().toString())}>
        <input
          id="send-msg-input"
          type="text"
          placeholder="Type a message"
          value={sendMsgField}
          onChange={handleSendMsgFieldChange}
        />
        <button id="send-msg-btn" type="submit">
          <FaArrowUp />
        </button>
      </form>
    </div>
  );
}

export default Chat;
