import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Signup from "./components/signup/Signup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  createBrowserRouter,
  Link,
  Route,
  RouterProvider,
  Routes,
  useNavigate,
} from "react-router-dom";
import Login from "./components/login/Login";

import { useContext } from "react";
import { userContext } from "./context/UserContext";
import Homepage from "./components/homepage/Homepage";

function App() {
  const { user, setUser } = useContext(userContext);

  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    const persistentLogIn = async () => {
      try {
        const response = await fetch(
          "https://outstanding-mead-aliishaq-5c08db28.koyeb.app/user/persistent-login",
          { credentials: "include" }
        );
        const { status, message, data } = await response.json();

        if (status == "success") {
          setUser(data);
        }

        setIsTokenChecked(true);
      } catch (error) {
        console.log(error.message);
        setIsTokenChecked(true);
      }
    };

    persistentLogIn();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: user ? <Homepage></Homepage> : <Login></Login>,
    },
    {
      path: "/signup",
      element: !user ? <Signup></Signup> : <Homepage></Homepage>,
    },
    {
      path: "/login",
      element: !user ? <Login></Login> : <Homepage></Homepage>,
    },
  ]);

  return (
    <div className="App">
      {isTokenChecked ? (
        <RouterProvider router={router} />
      ) : (
        <div className="loadingScreen">
          <span className="loader"></span>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </div>
  );
}

export default App;
