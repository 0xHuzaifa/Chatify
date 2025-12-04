// Utils
import ApiError from "../utils/ApiError.js";

// Models
import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

// Helpers - chat-controller
import { validateGroupName, populateChat } from "../helpers/chat/index.js";

const fetchChatsService = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .select(
      "participants lastMessage isGroupChat chatName updatedAt unreadCount"
    )
    .populate({
      path: "participants",
      select: "fullName isOnline lastSeen avatar",
    })
    .populate({
      path: "lastMessage",
      select: "sender content fileUrl contentType messageStatus createdAt",
      populate: { path: "sender", select: "fullName avatar" },
    })
    .sort({ updatedAt: -1 }) // ⭐ IMPORTANT: order chats by latest activity
    .lean({ virtuals: true });

  // const chats = await Chat.find({ participants: userId })
  //   .populate({
  //     path: "participants",
  //     select: "fullName isOnline lastSeen avatar",
  //   })
  //   .populate({
  //     path: "lastMessage",
  //     select: "sender content fileUrl contentType messageStatus createdAt",
  //     populate: { path: "sender", select: "fullName avatar" },
  //   })
  //   .lean()
  //   .sort({ updatedAt: -1 });
  if (!chats || chats.length === 0) {
    throw new ApiError(404, "No Chat Founds");
  }

  return chats;
};

const accessOrCreateChatService = async (loggedInUser, userId, groupId) => {
  // --------------------
  // 1) Access GROUP CHAT
  // --------------------
  if (groupId) {
    const group = await populateChat(
      Chat.findOne({
        _id: groupId,
        isGroup: true,
        participants: [loggedInUser],
      })
    );

    if (!group) throw new ApiError(404, "Group chat not found");

    return {
      success: 200,
      message: "Group chat fetched successfully",
      data: group,
    };
  }

  // --------------------
  // 2) Access / Create SINGLE CHAT
  // --------------------
  if (!userId) throw new Error(400, "single or group chat id is required");

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new ApiError(404, "target user not found");

  // Prevent creating chat with self
  if (loggedInUser.toString() === userId.toString()) {
    throw new ApiError(400, "Cannot create chat with yourself");
  }

  const chat = await populateChat(
    Chat.findOne({
      participants: { $all: [loggedInUser, userId], $size: 2 },
      isGroup: false,
    })
  ).lean();

  if (chat) {
    return {
      status: 200,
      message: "Chat fetched successfully",
      data: chat,
    };
  }

  const createChat = await Chat.create({
    participants: [loggedInUser, userId],
    isGroupChat: false,
  });

  const newChat = await populateChat(Chat.findById(createChat._id)).lean();

  return {
    status: 201,
    message: "Chat created successfully",
    data: newChat,
  };
};

const createGroupChatService = async (
  loggedInUser,
  groupName,
  participants
) => {
  // Validate participants arg
  if (!Array.isArray(participants)) {
    throw new ApiError(400, "participants must be an array of user ids");
  }

  // Normalize: convert all to strings
  let participantIds = participants
    .map((p) => String(p).trim())
    .filter(Boolean);

  const loggedIdStr = String(loggedInUser);
  // Add logged-in user to participants if not already included
  if (!participantIds.includes(loggedIdStr)) {
    participantIds.push(loggedIdStr);
  }

  // Remove duplicates
  participantIds = [...new Set(participants)];

  // Must have at least 3 participants (including logged-in user)
  if (participantIds.length < 3) {
    throw new ApiError(
      400,
      "At least 3 participants (including you) are required to form a group chat"
    );
  }

  // Verify users exist
  const users = await User.find({ _id: { $in: participantIds } })
    .select("_id")
    .lean();

  if (users.length !== participantIds.length) {
    throw new ApiError(400, "One or more participant user ids are invalid");
  }

  // Validate/normalize group name
  const validatedName = validateGroupName(groupName);

  // Create the group chat (always create, per your requirement)
  const chat = await Chat.create({
    participants: participantIds,
    isGroup: true,
    groupName: validatedName,
    groupAdmin: loggedInUser,
  });

  // Populate and return
  const populatedChat = await Chat.findById(chat._id)
    .populate({
      path: "participants",
      select: "fullName avatar isOnline lastSeen",
    })
    .populate({
      path: "groupAdmin",
      select: "fullName avatar",
    })
    .populate({
      path: "lastMessage",
      select: "sender content fileUrl contentType messageStatus createdAt",
      populate: { path: "sender", select: "fullName avatar" },
    })
    .lean();

  return populatedChat;
};

export { accessOrCreateChatService, fetchChatsService, createGroupChatService };
