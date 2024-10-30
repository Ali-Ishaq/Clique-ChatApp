const express = require("express");
const router = express.Router();
const { signUp, logIn, logOut, persistentLogIn} = require("../Controllers/authController");

router.post("/signup", signUp).post("/login", logIn).get("/logout",logOut).get("/persistent-login",persistentLogIn);

module.exports = router;
