import Chat from "../../models/Chat.model.js";
import Message from "../../models/Message.model.js";
import { isUserOnline } from "../userStatus.js";

const handleSendMessage = (io, socket) => {
  socket.on("send_message", async ({ chatId, content }) => {
    try {
      console.log("SEND HIT", { from: socket.user._id, chatId });

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) return;

      const message = await Message.create({
        chat: chatId,
        sender: socket.user._id,
        content,
        contentType: "text",
      });

      // Populate sender info for the client
      await message.populate("sender", "fullName avatar");

      // 🔥 MOST RELIABLE METHOD - emit to all participants via their user rooms
      for (const userId of chat.participants) {
        console.log("FORCE EMIT TO USER:", userId.toString());

        io.to(userId.toString()).emit("message_received", {
          ...message.toObject(),
          chat: chatId,
        });
      }
    } catch (err) {
      console.error("SEND ERROR", err);
    }
  });
};

const handleMarkAsRead = (io, socket) => {
  socket.on("mark_read", async (chatId) => {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) return;

      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: socket.user._id },
          readBy: { $ne: socket.user._id },
        },
        {
          $push: { readBy: socket.user._id },
          $set: { messageStatus: "read" },
        }
      );

      await Chat.findByIdAndUpdate(
        chatId,
        { $set: { "unreadCount.$[elem].count": 0 } },
        { arrayFilters: [{ "elem.user": socket.user._id }] }
      );

      socket.to(chatId).emit("message_read", {
        chatId,
        userId: socket.user._id,
      });
    } catch (err) {
      socket.emit("error", "Failed to mark read");
    }
  });
};

export { handleSendMessage, handleMarkAsRead };
