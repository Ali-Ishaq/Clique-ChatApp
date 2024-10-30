import React, { useContext, useState } from "react";

import "../signup/Signup.css";
import { FiUser, FiLock } from "react-icons/fi";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../../schemas/loginSchema";
import { userContext } from "../../context/UserContext";

const initialValues = {
  username: "",
  password: "",
};

function Login() {
  const [apiLoading, setApiLoading] = useState(false);

  const navigate =useNavigate()


  const { setUser } = useContext(userContext);

  const logInDb = async (credentials) => {
    
    setApiLoading(true);

    const response = await fetch("http://192.168.0.128:3000/user/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const { status, message, data } = await response.json();
    if (status == "success") {
      setUser(data);
      
      navigate('/')
    }
    
    setApiLoading(false);
    toast(message);
  };

  const { values, handleChange, handleBlur, handleSubmit, errors, touched } =
    useFormik({
      initialValues: initialValues,
      validationSchema: loginSchema,
      onSubmit: (values) => {
        logInDb(values);
      },
    });

  return (
    <div className="login-page auth-pages">
      <form className="signup-form" onSubmit={handleSubmit}>
        {/* <img className="card-bg-image" src="8093438.jpg" alt="" /> */}
        <div className="card-bg-image"> <img src="authpage.png" alt="" /></div>
        {/* <img className="card-bg-image" src="authpageBg.jpg" alt="" /> */}
        <div className="input-fields-container input-fields-container-login">
          <div className="input-field">
            <FiUser />
            <input
              type="text"
              name="username"
              id="username"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              placeholder="Username"
            />
            {errors.username && touched.username ? (
              <p className="error-message">*{errors.username}</p>
            ) : null}
          </div>

          <div className="input-field">
            <FiLock />
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              placeholder="Password"
            />
            {errors.password && touched.password ? (
              <p className="error-message">*{errors.password}</p>
            ) : null}
          </div>

          <div className="btn-container">
            <button id="login-btn" className="auth-submit-btns" type="submit">
              {!apiLoading ? <>Log In</> : <>waiting</>}
            </button>
            <p>
              Don't have an account? <Link to="/signup">SignUp</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
