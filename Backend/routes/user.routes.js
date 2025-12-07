import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { signup, login, updateProfile, checkAuth } from "../controllers/user.controller.js";

const userRouter=Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;