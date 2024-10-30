// Homepage.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";
import { socketContext } from "../../context/socketContext";
import Sidebar from "./Sidebar.jsx";
import Chat from "./Chat.jsx";
import "./Homepage.css";
import ChatPlaceholder from "./ChatPlaceholder.jsx";
import ChatSkeleton from "./ChatSkeleton.jsx";

function Homepage() {
  const [conversations, setConversations] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [sendMsgField, setSendMsgField] = useState("");

  const { user, setUser } = useContext(userContext);
  const { onlineUsers, liveMessage } = useContext(socketContext);

  const dashboardRef = useRef(null);

  // Persistent Login

  //Handle realtime new meesage
  useEffect(() => {
    // update messages state only if same chat is open
    // Checks wheter the correct chat is open

    if (liveMessage) {
      if (
        messages &&
        liveMessage.conversationId == selectedCard.conversationId
      ) {
        setMessages((prev) => {
          return [...prev, liveMessage];
        });

        // update lastUpdate Time & lastMsg
        setConversations(
          conversations.map((conversation) => {
            if (conversation.conversationId === liveMessage.conversationId) {
              return {
                ...conversation,
                lastMsg: liveMessage.message.slice(0, 15) + "...",
                lastUpdate: new Date(liveMessage.createdAt),
              };
            }
            return conversation;
          })
        );
      } else {
        // if chat is not open then update unread msgs counter & lastMsg in sidebar for respective conversation

        const doConversationExist = conversations?.some(
          (conv) => conv.conversationId == liveMessage.conversationId
        );

        if (doConversationExist) {
          setConversations(
            conversations?.map((conversation, index) => {
              if (conversation.conversationId == liveMessage.conversationId) {
                conversation.unreadMessages += 1;
                conversation.lastMsg = liveMessage.message.slice(0, 15) + "...";
                conversation.lastUpdate = new Date(liveMessage.createdAt);
              }
              return conversation;
            })
          );
        } else {
          fetch("http://192.168.0.128:3000/messages/get-conversation", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({conversationId:liveMessage.conversationId}),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json(); // Return the promise here
            })
            .then(({ data, status }) => {
              if (status === "success") {
                
                setConversations((prev) => [
                  ...prev, // Spread the previous state
                  {
                    profile: "",
                    conversationName: data.participants.length > 1?groupName:data.participants[0].username ,
                    userId: data.participants.length > 1? data.participants.map((elem) => elem._id) : data.participants[0]._id,
                    lastMsg: data.messages[0].message.slice(0, 15) + "...",
                    lastUpdate: new Date(data.messages[0].createdAt),
                    conversationId: data._id,
                    unreadMessages: 1,
                    isGroupConversation: data.participants.length > 1

                    
                  },
                ]);
                sortConversations();
              } else {
                console.error("Status was not success:", status);
              }
            })
            .catch((error) => {
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            });
        }
      }
    }

    sortConversations();
  }, [liveMessage]);

  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user]);

  

  const getConversations = async () => {
    try {
      const response = await fetch(
        "http://192.168.0.128:3000/messages/get-conversations",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const { data } = await response.json();

      

      if (data.length < 1) {
        setConversations([]);
      } else {
        let conversationsTemplate = data
          .map((elem) => {
            //remove conversation that has been created but not started
            if (!elem.lastMessage[0] && elem.participants.length < 2) {
             
              return null;
            }
            if (elem.participants.length > 1) {
              // if conversation is a group Chat
              return {
                profile: "",
                conversationName: elem.groupName,
                userId: elem.participants.map((elem) => elem._id),
                lastMsg: elem.lastMessage[0]
                  ? elem.lastMessage[0].message.slice(0, 15) + "..."
                  : "",
                lastUpdate:
                  elem.lastMessage.length > 0
                    ? new Date(elem.lastMessage[0].createdAt)
                    : new Date(elem.createdAt),
                conversationId: elem._id,
                unreadMessages: elem.unreadMessages[user._id],
                isGroupConversation: true,
              };
            } else {
              return {
                profile: "",
                conversationName: elem.participants[0].username,
                userId: elem.participants[0]._id,
                lastMsg: elem.lastMessage[0]
                  ? elem.lastMessage[0].message.slice(0, 15) + "..."
                  : "",
                lastUpdate: elem.lastMessage[0]
                  ? new Date(elem.lastMessage[0].createdAt)
                  : new Date(),
                conversationId: elem._id,
                unreadMessages: elem.unreadMessages[user._id],
                isGroupConversation: false,
              };
            }
          })
          .filter((e) => e != null);

        

        setConversations(conversationsTemplate);
      }
      sortConversations();
    } catch (error) {
      console.log(error.message);
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      // scroll to chat section on MOBILE DEVICES

      if (window.innerWidth < 767) {
        mobileHorizontalScroll(1);
      }

      const conversation = conversations.find(
        (conv) => conv.conversationId == conversationId
      );

      setSelectedCard(conversation);
      setIsChatLoading(true);

      // getting chat of selected conversation
      const response = await fetch(
        "http://192.168.0.128:3000/messages/get-conversation-messages",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversationId: conversationId }),
        }
      );

      const { data, status, message } = await response.json();

      setMessages(data);
      setIsChatLoading(false);

      
    } catch (error) {
      console.log(error.message);
    }

  
  };

  const handleSendMsgFieldChange = (e) => {
    setSendMsgField(e.target.value);
  };

  const handleSendMsgFormSubmit = async (e, sentTime) => {
    e.preventDefault();
    
    const conversationId = selectedCard.conversationId;

    const fetchBody = {
      receiverId: Array.isArray(selectedCard.userId)
        ? selectedCard.userId
        : [selectedCard.userId],
      message: sendMsgField,
      conversationId: conversationId,
    };
    setSendMsgField("");

    try {
      if (sendMsgField.length > 0 && selectedCard) {
        setMessages((prev) => [
          ...prev,
          { message: fetchBody.message, isSent: true, createdAt: sentTime },
        ]);

        const res = await fetch(
          "http://192.168.0.128:3000/messages/sendMessage",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fetchBody),
          }
        );

        const { status, message, data } = await res.json();

        if (status == "success") {
          setConversations(
            conversations.map((conversation) => {
              if (conversation.conversationId == conversationId) {
                conversation.lastMsg = data.message.slice(0, 15) + "...";
                conversation.lastUpdate = new Date(data.createdAt);
              }
              
              return conversation;
            })
          );
        }

        sortConversations();
        toast(message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const sortConversations = () => {
    setConversations((prev) => {
      return (
        prev &&
        [...prev].sort(
          (a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate)
        )
      );
    });
  };

  const mobileHorizontalScroll = (direction) => {
    if (direction < 0) {
      setSelectedCard(null);
      setMessages(null);
    }
    const scrollAmount = window.innerWidth * direction; // Calculate scroll amount
    const duration = 200; // Duration in milliseconds
    const startTime = performance.now(); // Get the start time
    const initialScrollLeft = dashboardRef.current.scrollLeft; // Get current scroll position

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime; // Calculate time elapsed
      const progress = Math.min(timeElapsed / duration, 1); // Normalize progress (0 to 1)

      // Calculate the new scroll position
      const newScrollLeft = initialScrollLeft + scrollAmount * progress;
      dashboardRef.current.scrollLeft = newScrollLeft;

      // Continue the animation if time hasn't elapsed
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll); // Continue animating
      } else {
        // Optionally, ensure we end exactly at the target position
        dashboardRef.current.scrollLeft = initialScrollLeft + scrollAmount;
      }
    };

    requestAnimationFrame(animateScroll); // Start the animation
  };

  return (
    <div className="dashboard-container">
      <div className="chat-dashboard" ref={dashboardRef}>
        <Sidebar
          conversations={conversations}
          setConversations={setConversations}
          selectConversation={selectConversation}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          onlineUsers={onlineUsers}
          setMessages={setMessages}
          sortConversations={sortConversations}
        />
        {selectedCard ? (
          <>
            {!isChatLoading ? (
              <Chat
                messages={messages}
                selectedCard={selectedCard}
                setMessages={setMessages}
                handleSendMsgFormSubmit={handleSendMsgFormSubmit}
                sendMsgField={sendMsgField}
                handleSendMsgFieldChange={handleSendMsgFieldChange}
                mobileHorizontalScroll={mobileHorizontalScroll}
                onlineUsers={onlineUsers}
              />
            ) : (
              <ChatSkeleton
                selectedCard={selectedCard}
                mobileHorizontalScroll={mobileHorizontalScroll}
                onlineUsers={onlineUsers}
              />
            )}
          </>
        ) : (
          <ChatPlaceholder></ChatPlaceholder>
        )}
      </div>
    </div>
  );
}

export default Homepage;
