import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/fetch-chats", fetchChats);
router.post("/access-chat", accessChat);
router.post("/create-group", createGroupChat);

export default router;
