import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import io from "socket.io-client";
import { userContext } from "./UserContext.jsx";

export const socketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [liveMessage, setLiveMessage] = useState([]);

  const { user } = useContext(userContext);

  useEffect(() => {
    if (user) {
      const socket = io(
        "https://outstanding-mead-aliishaq-5c08db28.koyeb.app",
        {
          query: {
            userId: user._id,
          },
        }
      );
      setSocket(socket);

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("getMessage", (newMessage) => {
        setLiveMessage({ ...newMessage, isSent: false });
      });

      return () => {
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers, liveMessage }}>
      {children}
    </socketContext.Provider>
  );
};
