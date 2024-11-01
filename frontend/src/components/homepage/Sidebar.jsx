// Sidebar.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./Homepage.css";
import { socketContext } from "../../context/socketContext";
import { IoPersonAdd } from "react-icons/io5";
import { TbDotsVertical } from "react-icons/tb";
import { BsChatLeftText } from "react-icons/bs";
import { MdGroups } from "react-icons/md";
import { MdOutlineDownloading } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";

import { IoPersonAddOutline } from "react-icons/io5";
import CreateGroupPage from "./CreateGroupPage";

const skeletonConversations = [1, 2, 3, 4];

function Sidebar({
  conversations,
  selectConversation,
  setConversations,
  selectedCard,
  setSelectedCard,
  onlineUsers,
  setMessages,
  sortConversations,
}) {
  const [userSearchResult, setUserSearchResult] = useState(null);
  const { socket } = useContext(socketContext);
  const [selectedMenu, setSelectedMenu] = useState("option1");

  const conversationCardContainerRef = useRef();
  const sidebarNavMenuRef = useRef(null);
  const searchUserContainerRef = useRef();
  const searchUserInputRef = useRef();
  const menuDropDownRef = useRef();
  const createGroupPageRef = useRef(null);

  // Explanation below in createConversation Function
  const [newConversationId, setNewConversationId] = useState(null);
  useEffect(() => {
    if (newConversationId) {
      selectConversation(newConversationId);
    }
  }, [newConversationId]);

  const getLastUpdate = (msgDate) => {
    let ellapsedTimeInDays = (new Date() - msgDate) / (1000 * 60 * 60 * 24);

    if (ellapsedTimeInDays >= 2) {
      return `${msgDate.getDate()}/${msgDate.getMonth() + 1}/${
        msgDate.getFullYear() % 100
      }`;
    } else if (ellapsedTimeInDays >= 1) {
      return "yesterday";
    } else if (ellapsedTimeInDays < 1) {
      return `${msgDate.getHours()}:${msgDate.getMinutes()}`;
    }
  };

  const handleSearchUserFocus = (e) => {
    conversationCardContainerRef.current.style.display = "none";
    sidebarNavMenuRef.current.style.display = "none";
    searchUserContainerRef.current.style.display = "flex";
    setMessages(null);
    setSelectedCard(null);

    socket.on("getUserSearchResult", (users) => {
      setUserSearchResult(users);
    });
  };
  const handleSearchUserBlur = (e) => {
    setTimeout(() => {
      conversationCardContainerRef.current.style.display = "";
      sidebarNavMenuRef.current.style.display = "";
      searchUserContainerRef.current.style.display = "";
      setUserSearchResult(null);
      setSelectedMenu("option1");
    }, 50);

    e.target.value = "";
    socket.off("getUserSearchResult");
  };

  let timeoutId;
  const handleSearchUserChange = (e) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (e.target.value.length < 1) {
        setUserSearchResult(null);
      }
      if (socket && e.target.value.length > 0) {
        socket.emit("searchUsers", e.target.value);
      }
    }, 300);
  };

  const createConversation = async (e, id) => {
    e.stopPropagation();
    try {
      const doesConversationExist = conversations.find((conversation) => {
        return conversation.userId == id;
      });

      if (!doesConversationExist) {
        const response = await fetch(
          "https://outstanding-mead-aliishaq-5c08db28.koyeb.app/messages/create-conversation",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          }
        );

        const { status, message, data } = await response.json();

        if (status == "success") {
          setConversations((prev) => [
            ...prev,
            {
              profile: "",
              conversationName: data.participants[0].username,
              userId: data.participants[0]._id,
              lastMsg: "",
              lastUpdate: new Date(data.createdAt),
              conversationId: data._id,
              unreadMessages: 0,
              isGroupConversation: false,
            },
          ]);

          setNewConversationId(data._id);

          // selectConversation will not be able to use updated state of Conversations

          //* selectConversation(data.participants[0]._id); *//

          // Therfore, using useEffect hook to use updated state of conversations
          // in selectConversation function
        }
      } else {
        selectConversation(doesConversationExist.conversationId);
      }

      sortConversations();
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      const response = await fetch(
        "https://outstanding-mead-aliishaq-5c08db28.koyeb.app/user/logout",
        {
          credentials: "include",
        }
      );
      const { status, message } = await response.json();
      if (status == "success") {
        location.reload();
      }
      toast(message);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleMenuChange = (e) => {
    setSelectedMenu(e.target.value);
  };

  return (
    <div className="conversations-sidebar">
      <div className="sidebar-header">
        <h1>CLIQUE</h1>

        <div
          className="menu"
          tabIndex="0"
          onFocus={() => {
            menuDropDownRef.current.style.display = "flex";
          }}
          onBlur={() => {
            menuDropDownRef.current.style.display = "";
          }}
        >
          <TbDotsVertical size={"22px"} />
          <div className="menu-dropdown" ref={menuDropDownRef}>
            <p
              onClick={() => {
                createGroupPageRef.current.style.display = "flex";
                menuDropDownRef.current.style.display = "";
                setSelectedCard(null);
                setMessages(null);
              }}
            >
              New group
            </p>
            <p>Select chats</p>
            <p onClick={handleLogOut}>Log out</p>
          </div>
        </div>
      </div>

      <div className="search-bar" tabIndex={"0"}>
        <FiSearch />
        <input
          type="text"
          placeholder="Search"
          onFocus={handleSearchUserFocus}
          onBlur={handleSearchUserBlur}
          onChange={handleSearchUserChange}
          ref={searchUserInputRef}
        />

        <div className="search-user-container" ref={searchUserContainerRef}>
          {userSearchResult && userSearchResult?.length > 0 ? (
            userSearchResult.map((user) => (
              <div
                className="user-card"
                onMouseDown={(e) => createConversation(e, user._id)}
              >
                <div className="pfp-sec">
                  <img src="pfp.jpg" alt="" />
                </div>
                <div className="username-sec">
                  <h1>{user.username}</h1>
                </div>
                <div className="add-user-btn">
                  {!conversations?.some(
                    (convo) => convo.userId == user._id
                  ) && (
                    <button
                      onMouseDown={(e) => createConversation(e, user._id)}
                    >
                      <IoPersonAdd size={"17px"} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <>No User found</>
          )}
        </div>
      </div>

      <div
        className="conversation-cards-container"
        ref={conversationCardContainerRef}
      >
        {conversations
          ? conversations.map((value, index) => (
              <div
                onClick={() => {
                  selectConversation(value.conversationId);
                  /* clearing unread messages counter*/ value.unreadMessages = 0;
                }}
                className={`${
                  selectedCard?.conversationId == value.conversationId
                    ? "selected-conversation-card"
                    : "conversation-card"
                } `}
                key={index}
              >
                <div className="pfp-sec">
                  <img src="pfp.jpg" alt="" />
                  <span
                    className="active-user-dot"
                    style={
                      onlineUsers.includes(value.userId)
                        ? {}
                        : { display: "none" }
                    }
                  ></span>
                </div>
                <div className="username-sec">
                  <h1 className="username">{value.conversationName}</h1>
                  <p className="last-msg">{value.lastMsg}</p>
                </div>
                <div className="last-update-sec">
                  <p>{getLastUpdate(value.lastUpdate)}</p>
                  {value.unreadMessages > 0 && (
                    <p className="unread-msgs">{value.unreadMessages}</p>
                  )}
                </div>
              </div>
            ))
          : skeletonConversations.map(() => (
              <div className="conversation-card conversation-card-skeleton"></div>
            ))}
      </div>

      <div className="sidebar-navigation-menu" ref={sidebarNavMenuRef}>
        <div
          className={`chats ${selectedMenu == "option1" && "selected-menu"}`}
        >
          <label htmlFor="radio1">
            <BsChatLeftText color="white" size={"20px"} />
            <p>Chats</p>
            <input
              id="radio1"
              type="radio"
              value="option1"
              checked={selectedMenu === "option1"}
              onChange={handleMenuChange}
            />
          </label>
        </div>

        <div
          className={`groups ${selectedMenu == "option2" && "selected-menu"}`}
        >
          <label htmlFor="radio2">
            <MdGroups color="white" size={"27px"} />
            <p>Groups</p>
            <input
              id="radio2"
              type="radio"
              value="option2"
              checked={selectedMenu === "option2"}
              onChange={handleMenuChange}
            />
          </label>
        </div>

        <div
          className={`updates ${selectedMenu == "option3" && "selected-menu"}`}
        >
          <label htmlFor="radio3">
            <MdOutlineDownloading color="white" size={"25px"} />
            <p>Updates</p>
            <input
              id="radio3"
              type="radio"
              value="option3"
              checked={selectedMenu === "option3"}
              onChange={handleMenuChange}
            />
          </label>
        </div>
        <div
          className={`add-user ${selectedMenu == "option4" && "selected-menu"}`}
          onClick={() => {
            searchUserInputRef.current.focus();
          }}
        >
          <label htmlFor="radio4">
            <RiUserAddLine color="white" size={"22px"} />
            <p>Add</p>
            <input
              id="radio4"
              type="radio"
              value="option4"
              checked={selectedMenu === "option4"}
              onChange={handleMenuChange}
            />
          </label>
        </div>
      </div>

      <div ref={createGroupPageRef} style={{ display: "none" }}>
        <CreateGroupPage
          conversations={conversations}
          createGroupPageRef={createGroupPageRef}
          setConversations={setConversations}
          selectConversation={selectConversation}
          sortConversations={sortConversations}
        >
          {" "}
        </CreateGroupPage>
      </div>
    </div>
  );
}

export default Sidebar;
