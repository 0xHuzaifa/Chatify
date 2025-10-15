import Chat from "../models/Chat.model.js";

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

export { accessOrCreateChatService, fetchChatsService };
