import React, { useContext, useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiMail } from "react-icons/fi";

import { useFormik } from "formik";
import { signUpSchema } from "../../schemas/signupSchema";
import { toast } from "react-toastify";
import { userContext } from "../../context/UserContext";

const initialValues = {
  fullName: "",
  username: "",
  email: "",
  password: "",
};

function Signup() {
  const [apiLoading, setApiLoading] = useState(false);
  const { setUser } = useContext(userContext);
  const navigate = useNavigate();

  const createUser = async (user) => {
    setApiLoading(true);

    const response = await fetch(
      "https://outstanding-mead-aliishaq-5c08db28.koyeb.app/user/signup",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );

    const { message, status, data } = await response.json();
    if (status == "success") {
      setUser(data);
      navigate("/");
    }

    toast(message);
    setApiLoading(false);
  };

  const { handleSubmit, errors, values, handleChange, handleBlur, touched } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUpSchema,
      onSubmit: (values) => {
        createUser(values);
      },
    });

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} className="signup-form">
        {/* <img className="card-bg-image" src="8093438.jpg" alt="" /> */}
        <div className="card-bg-image">
          <img src="authpage.png" alt="" />
        </div>
        <div className="input-fields-container">
          <div className="input-field">
            <FiUser />
            <input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Full Name"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.fullName && touched.fullName ? (
              <p className="error-message">*{errors.fullName}</p>
            ) : null}
          </div>

          <div className="input-field">
            <FiUser />
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.username && touched.username ? (
              <p className="error-message">*{errors.username}</p>
            ) : null}
          </div>

          <div className="input-field">
            <FiMail />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email ? (
              <p className="error-message">*{errors.email}</p>
            ) : null}
          </div>

          <div className="input-field">
            <FiLock />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password ? (
              <p className="error-message">*{errors.password}</p>
            ) : null}
          </div>

          <div className="btn-container">
            <button id="signup-btn" className="auth-submit-btns" type="submit">
              {!apiLoading ? <>Sign Up</> : <>waiting</>}
            </button>
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signup;
