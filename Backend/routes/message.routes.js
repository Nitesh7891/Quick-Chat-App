import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getUsersForSidebar } from "../controllers/message.controller.js";
import { getMessages } from "../controllers/message.controller.js";
import { markMessageAsSeen } from "../controllers/message.controller.js";
import { sendMessage } from "../controllers/message.controller.js";


const messageRouter=Router();

messageRouter.get("/users",protectRoute,getUsersForSidebar)
messageRouter.get("/:id",protectRoute,getMessages)
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen)
messageRouter.post("/send/:id",protectRoute,sendMessage)

export default messageRouter;

