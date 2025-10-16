import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

// Helpers - chat-controller
import validateGroupName from "../helpers/chat-controller/validateGroupName.js";
import { isValidObjectId } from "mongoose";
import ApiError from "../utils/ApiError.js";

const accessOrCreateChatService = async (loggedInUser, userId) => {
  try {
    const chat = await Chat.findOne({
      participants: { $all: [loggedInUser, userId], $size: 2 },
      isGroupChat: false,
    })
      .populate({
        path: "participants",
        select: "fullName isOnline lastSeen avatar",
      })
      .populate({
        path: "lastMessage",
        select: "sender content fileUrl contentType messageStatus createdAt",
        populate: { path: "sender", select: "fullName avatar" },
      })
      .lean();

    if (!chat) {
      const createChat = await Chat.create({
        participants: [loggedInUser, userId],
        isGroupChat: false,
      });

      const newChat = await Chat.findById(createChat._id)
        .populate({
          path: "participants",
          select: "fullName isOnline lastSeen avatar",
        })
        .populate({
          path: "lastMessage",
          select: "sender content fileUrl contentType messageStatus createdAt",
          populate: { path: "sender", select: "fullName avatar" },
        })
        .lean();

      return {
        status: 201,
        message: "Chat created successfully",
        data: newChat,
      };
    }

    return {
      status: 200,
      message: "Chat fetched successfully",
      data: chat,
    };
  } catch (error) {
    console.error("Unable to access chat");
    throw new ApiError(400, "Unable to access chat");
  }
};

const fetchChatsService = async (userId) => {
  try {
    const chat = await Chat.find({ participants: userId })
      .populate({
        path: "participants",
        select: "fullName isOnline lastSeen avatar",
      })
      .populate({
        path: "lastMessage",
        select: "sender content fileUrl contentType messageStatus createdAt",
        populate: { path: "sender", select: "fullName avatar" },
      })
      .lean();

    return chat;
  } catch (error) {
    console.error("Unable to fetch chats");
    throw new ApiError(400, "Unable to fetch chats");
  }
};

const createGroupChatService = async (
  loggedInUser,
  groupName,
  participants
) => {
  try {
    const GroupName = validateGroupName(groupName);

    if (!participants || participants.length < 2) {
      throw new ApiError(
        400,
        "More than 2 participants are required to form a group chat"
      );
    }

    // Add logged-in user to participants if not already included
    if (!participants.includes(loggedInUser.toString())) {
      participants.push(loggedInUser.toString());
    }

    // Validate all participants exist and are unique
    const uniqueParticipants = [...new Set(participants)]; // Remove duplicates
    const users = await User.find({ _id: { $in: uniqueParticipants } });
    if (users.length !== uniqueParticipants.length) {
      throw new ApiError(400, "Invalid user IDs");
    }

    // Create group chat
    const chat = await Chat.create({
      participants: uniqueParticipants,
      isGroupChat: true,
      chatName: GroupName,
      groupAdmin: loggedInUser,
    });

    // Populate the chat
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: "participants",
        select: "username avatar isOnline lastSeen",
      })
      .populate({
        path: "latestMessage",
        select: "content fileUrl messageType createdAt status sender",
        populate: { path: "sender", select: "username avatar" },
      });

    return populatedChat;
  } catch (error) {
    console.error("Unable to create group chat");
    throw new ApiError(400, "Unable to create group chat");
  }
};

export { accessOrCreateChatService, fetchChatsService, createGroupChatService };
