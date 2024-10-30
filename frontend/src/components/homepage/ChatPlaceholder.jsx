import React, { useContext } from 'react'
import "./Homepage.css"
import { BsChatLeftText } from "react-icons/bs";
import { userContext } from '../../context/UserContext';


function ChatPlaceholder() {

  const {user}=useContext(userContext)
  return (
    <div className='chats-container-placeholder'>
        <h1>Hey, {user.fullName} <img src="wavinghand.png" alt="👋🏻" /> .</h1>
        <p>Select a chat to start messaging</p>
        <BsChatLeftText size={'20px'}/>
        
    </div>
  )
}

export default ChatPlaceholder