import {
  fetchAllMessagesService,
  sendMessageService,
} from "../services/message.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const sendMessage = asyncHandler(async function (req, res) {
  const loggedInUser = req.user._id;
  const { content, chatId } = req.body;
  const file = req.file;

  if (!content) {
    throw new ApiError(400, "Content is required to send a message");
  }

  if (!chatId) {
    throw new ApiError(400, "chat id is required");
  }

  const result = await sendMessageService(loggedInUser, content, chatId, file);

  return res
    .status(201)
    .json(new ApiResponse(201, "New Message created successfully", result));
});

const getAllMessages = asyncHandler(async function (req, res) {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "chat id is required");
  }

  const result = await fetchAllMessagesService(chatId);

  return res
    .status(200)
    .json(new ApiResponse(200, "All Message fetched successfully", result));
});

export { sendMessage, getAllMessages };
