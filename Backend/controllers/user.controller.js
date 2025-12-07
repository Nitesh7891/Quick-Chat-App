import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";


//Signup user
export const signup=async(req,res)=>{
    const {email, fullName, password,bio}=req.body;
    try{
      if(!email || !fullName || !password || !bio){
        return res.status(400).json({message:"All fields are required",success:false});
      }

        const user=await User.findOne({email:email});
        if(user) return res.status(400).json({message:"User already exists",success:false});

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

         const newUser=await User.create({
            email,
            fullName,
            password:hashedPassword,
            bio
         });

         const token=generateToken(newUser._id);

         return res.status(201).json({message:"User created successfully", success:true, user:newUser, token});

    }
    catch(error){
        console.log("Error in signup", error);
        return res.status(500).json({message:"Internal Server Error", success:false});
    }
}


//Login User
export const login=async(req,res)=>{
  try{
     const{email,password}=req.body;
      const userData=await User.findOne({email:email}) ;
      if(!userData){
        console.log("Invalid email or password");
        return res.status(400).json({message:"Invalid email or password", success:false});
      }

      const isPasswordCorrect=await bcrypt.compare(password,userData.password);
      
      if(!isPasswordCorrect){
        console.log("Password does not match");
        return res.status(400).json({message:"Invalid credentials", success:false});
      }

      const token=generateToken(userData._id);

      return res.status(200).json({message:"Login successful", success:true, user:userData, token});
  }
  catch(error){
      console.log("Error in login", error.message);
      return res.status(500).json({message:"Internal Server Error", success:false});
  }
}


//check if user is authenticated
export const checkAuth=async(req,res)=>{
 try {
    return res.status(200).json({message:"User is authenticated", success:true, user:req.user});
 } catch (error) {
  console.log("Error in checkAuth:", error.message);
  return res.status(500).json({message:"Internal Server Error", success:false});
 }
}

//Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;

    let updatedData = { fullName, bio };

    // If user uploads a new profile image
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
      });
      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.log("Error in updating profile:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
