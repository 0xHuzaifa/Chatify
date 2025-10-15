import express from "express";
import authentication from "../middlewares/auth.middleware.js";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/access-chat", accessChat);
router.get("/fetch-chats", fetchChats);

export default router;
