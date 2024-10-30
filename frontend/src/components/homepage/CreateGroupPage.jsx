import React, { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./Homepage.css";
import { toast } from "react-toastify";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";

import "./Homepage.css";

function CreateGroupPage({
  conversations,
  setConversations,
  createGroupPageRef,
  selectConversation,
  sortConversations,
}) {
  const [participants, setParticipants] = useState([]);
  const [groupName, setGroupName] = useState(null);
  const [participantsList, setParticipantsList] = useState();
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [groupConversationId, setGroupConversationId] = useState(null);

  const searchBarRef = useRef(null);

  useEffect(() => {
    setParticipantsList(conversations);
  }, [conversations]);

  useEffect(() => {
    if (groupConversationId) {
      selectConversation(groupConversationId);
      sortConversations();
    }
  }, [groupConversationId]);

  const addGroupParticipants = (e, participantId, toAdd) => {
    e.stopPropagation();
    
    if (participantId && !participants.includes(participantId) && toAdd) {
      setParticipants((prev) => [...prev, participantId]);
    } else if (
      participantId &&
      participants.includes(participantId) &&
      !toAdd
    ) {
      setParticipants((prev) => prev.filter((user) => user != participantId));
    }

  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSearch = (e) => {
    setParticipantsList(
      conversations.filter((conv) =>
        conv.conversationName.includes(e.target.value)
      )
    );
  };

  const createGroup = async () => {
    if (participants.length < 2) {
      toast.error("Select atleast 2 members");
      return;
    }
    if (!groupName || groupName.length < 1) {
      toast.error("Enter group name");
      return;
    }

    try {
      setIsRequestPending(true);

      const response = await fetch(
        "http://192.168.0.128:3000/messages/create-group-conversation",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participants: participants,
            groupName: groupName,
          }),
        }
      );

      const { status, message, data } = await response.json();

      setIsRequestPending(false);

      if (status == "success") {
        setParticipants([]);
        setGroupName(null);

        setConversations((prev) => [
          ...prev,
          {
            profile: "",
            conversationName: data.groupName,
            userId: data.participants,
            lastMsg: "",
            lastUpdate: new Date(),
            conversationId: data._id,
            unreadMessages: 0,
            isGroupConversation: true,
          },
        ]);

        exitCreateGroupPage();
        setGroupConversationId(data._id);
      } else {
        toast.error(message);
      }
    } catch (error) {}
  };

  const exitCreateGroupPage = () => {
    createGroupPageRef.current.style.display = "none";
    setGroupName(null);
    setParticipants([]);
  };

  return (
    <div className="create-group-page" tabIndex={"0"}>
      <div className="create-group-page-back">
        <IoArrowBackOutline onClick={exitCreateGroupPage} />
        <h1>
          New group
          <br />
          <p>Add participants</p>
        </h1>
        <FiSearch
          className="search-svg"
          onClick={() => {
            searchBarRef.current.style.width = "100%";
          }}
        />

        <div className="search-bar" tabIndex={"0"} ref={searchBarRef}>
          <IoArrowBackOutline
            onClick={() => {
              searchBarRef.current.style.width = "";
            }}
          />
          <input
            type="text"
            placeholder="Search"
            // onFocus={handleSearchUserFocus}
            // onBlur={handleSearchUserBlur}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="group-participants">
        {participantsList && participantsList.length > 0 ? (
          participantsList.map((user) => {
            if (user.isGroupConversation) {
              return null;
            } else {
              return (
                <div className="user-card">
                  <div className="pfp-sec">
                    <img src="pfp.jpg" alt="" />
                  </div>
                  <div className="username-sec">
                    <h1>{user.conversationName}</h1>
                  </div>
                  <div className="add-user-btn">
                    {!participants.includes(user.userId) ? (
                      <button
                        style={{ backgroundColor: "transparent" }}
                        onMouseDown={(e) =>
                          addGroupParticipants(e, user.userId, true)
                        }
                      >
                        <IoIosAddCircleOutline size={"20px"} />
                      </button>
                    ) : (
                      <button
                        style={{ backgroundColor: "transparent" }}
                        onMouseDown={(e) =>
                          addGroupParticipants(e, user.userId, false)
                        }
                      >
                        <IoIosRemoveCircleOutline size={"20px"} color="red" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          })
        ) : (
          <>No Existing User found</>
        )}
      </div>

      <div className="group-details-creation">
        <input
          type="text"
          placeholder="Enter Group Name"
          onChange={handleGroupNameChange}
        />
        <button onClick={createGroup} disabled={isRequestPending}>
          Create
        </button>
      </div>
    </div>
  );
}

export default CreateGroupPage;
