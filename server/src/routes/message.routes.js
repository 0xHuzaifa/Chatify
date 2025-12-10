import express from "express";
import {
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/:chatId", getAllMessages);
router.post("/send", sendMessage);

export default router;
