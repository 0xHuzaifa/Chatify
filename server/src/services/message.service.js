import mongoose from "mongoose";
import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import ApiError from "../utils/ApiError.js";

const getAllMessagesService = async (chatId, cursor, limit) => {
  const matchStage = { chat: new mongoose.Types.ObjectId(chatId) };

  if (cursor) {
    matchStage.createdAt = { $lt: new Date(cursor) };
  }

  const pipeline = [
    { $match: matchStage },

    { $sort: { createdAt: -1 } },

    { $limit: limit },

    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },

    { $unwind: "$sender" },

    // Only send needed fields
    {
      $project: {
        content: 1,
        fileUrl: 1,
        contentType: 1,
        messageStatus: 1,
        createdAt: 1,
        "sender.fullName": 1,
        "sender.avatar": 1,
      },
    },
  ];

  let messages = await Message.aggregate(pipeline);

  // Reverse: oldest → newest
  messages = messages.reverse();

  const hasMore = messages.length === limit;
  let nextCursor;

  if (hasMore) {
    nextCursor =
      messages.length > 0 ? messages[0].createdAt.toISOString() : null;
  }

  return {
    messages,
    nextCursor,
    hasMore,
  };
};

const sendMessageService = async (loggedInUser, content, chatId, file) => {
  try {
    const chatExist = await Chat.findById(chatId);
    if (!chatExist) {
      throw new ApiError(404, "Chat not exist");
    }

    let contentType;
    if (file) {
      contentType = file.mimeType;
    } else {
      contentType = "text";
    }

    const newMessage = await Message.create({
      chat: chatExist._id,
      sender: loggedInUser,
      content,
      contentType,
    });

    return newMessage;
  } catch (error) {
    console.error("send message service error", error);
    throw error;
  }
};

export { sendMessageService, getAllMessagesService };
