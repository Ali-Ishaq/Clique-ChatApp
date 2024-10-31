const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../Models/userModel");

const signUp = async (req, res) => {
  try {
    const { fullName, username, password,email } = req.body;
    

    // Check if the username is already taken (optional)
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { username: username }
    ]
     }).select('email username');

    if (existingUser) {

      if(existingUser.username==username && existingUser.email==email){
        return res.status(400).json({
          status: "error",
          message: "User already exists",
        });
      }else if(existingUser.username==username){
        return res.status(400).json({
          status: "error",
          message: "Username is taken",
        });
      }else if(existingUser.email==email){
        return res.status(400).json({
          status: "error",
          message: "Email already in use",
        });
      }else{
        return res.status(400).json({
          status: "error",
          message: "Internal Server Error",
        });
      }

    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword,email,fullName,email });
    const savedUser=await newUser.save();
    const responseData = {...savedUser._doc}
    delete responseData.password
    // Generating Token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure:true
    

    });

    res.status(201).json({
      status: "success",
      username: newUser.username,
      data:responseData
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the user",
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User doesn't exist",
        
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Credentials",
      });
    }

    // Generating Token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const responseData={...user._doc}
    delete responseData.password

    res.status(200).json({
      status: "success",
      message: "Login Successful",
      data:responseData
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const logOut = async (req, res) => {
  try {
    
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Secure cookie in production
    });

    res.json({
      status:"success",
      message:"Logged out Succesfully"
    })

  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const persistentLogIn=async(req,res)=>{
    
  try {
    
    const token = req.cookies.token;

    if (!token) {
      return res.json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ username }).select('-password');

    if(user){
      res.status(200).json({
        status:'success',
        messsage:'Successfully Logged In',
        data:user
      })
    }else{
      return res.json({
        status: "unauthorized",
        message: "Unauthorized User",
      });
    }


  } catch (error) {
    res.json({
      status:'unauthorized',
      messsage:'Unauthorized User'
    })
  }

}

module.exports = {
  signUp,
  logIn,
  logOut,
  persistentLogIn
};
