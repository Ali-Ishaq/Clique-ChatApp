import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { UserContextProvider } from "./context/UserContext.jsx";
import { SocketContextProvider } from "./context/socketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserContextProvider>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </UserContextProvider>
  </StrictMode>
);