import mongoose, { isValidObjectId } from "mongoose";

// Utils
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Services
import {
  accessOrCreateChatService,
  createGroupChatService,
  fetchChatsService,
} from "../services/chat.service.js";

const accessChat = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;
  const userId = req.body.userId;

  // Ensure the provided userId is a valid MongoDB ObjectId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid target user id");
  }

  const chat = await accessOrCreateChatService(loggedInUser, userId);

  return res
    .status(200)
    .json(new ApiResponse(chat.status, chat.message, chat.data));
});

const fetchChats = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;

  const result = await fetchChatsService(loggedInUser);

  return res
    .status(200)
    .json(new ApiResponse(200, "Chats fetched successfully", result));
});

const createGroupChat = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;
  const { groupName, participants } = req.body;

  const createGroupChat = await createGroupChatService(
    loggedInUser,
    groupName,
    participants
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Group chat created", createGroupChat));
});

export { accessChat, fetchChats, createGroupChat };
