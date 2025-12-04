// Utils
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Services
import {
  accessOrCreateChatService,
  createGroupChatService,
  fetchChatsService,
} from "../services/chat.service.js";

const fetchChats = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;

  const result = await fetchChatsService(loggedInUser);

  return res
    .status(200)
    .json(new ApiResponse(200, "Chats fetched successfully", result));
});

const accessChat = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;
  const { userId, groupId } = req.body;

  const chat = await accessOrCreateChatService(loggedInUser, userId, groupId);

  return res
    .status(200)
    .json(new ApiResponse(chat.status, chat.message, chat.data));
});

const createGroupChat = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;
  const { groupName, participants } = req.body;

  const result = await createGroupChatService(
    loggedInUser,
    groupName,
    participants
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Group chat created", result));
});

export { accessChat, fetchChats, createGroupChat };
