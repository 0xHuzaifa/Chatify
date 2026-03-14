import Chat from "../../models/Chat.model.js";
import Message from "../../models/Message.model.js";
import { getUserSocketIds } from "../userStatus.js";

const handleSendMessage = (io, socket) => {
  socket.on("send_message", async ({ chatId, content }, ack) => {
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

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $set: { lastMessage: message._id, updatedAt: new Date() } },
        { new: true }
      ).select("_id participants unreadCount updatedAt");

      // If a recipient is currently in this chat room, treat the message as read for them
      // so unread count doesn't increase while the chat is open.
      const inRoomUserIds = new Set();
      for (const userId of chat.participants) {
        const uid = userId.toString();
        if (uid === socket.user._id.toString()) continue; // sender

        const socketIds = getUserSocketIds(uid);
        const isInRoom = socketIds.some((sid) =>
          io.sockets.adapter.sids.get(sid)?.has(chatId)
        );

        if (isInRoom) inRoomUserIds.add(uid);
      }

      if (inRoomUserIds.size > 0) {
        await Promise.all([
          ...Array.from(inRoomUserIds).map((uid) =>
            Chat.updateOne(
              { _id: chatId },
              { $set: { "unreadCount.$[elem].count": 0 } },
              { arrayFilters: [{ "elem.user": uid }], timestamps: false }
            )
          ),
          ...Array.from(inRoomUserIds).map((uid) =>
            Message.updateOne(
              { _id: message._id },
              {
                $addToSet: { readBy: uid },
                $set: { messageStatus: "read" },
              },
              { timestamps: false }
            )
          ),
        ]);
      }

      const chatForUnread =
        inRoomUserIds.size > 0
          ? await Chat.findById(chatId).select("unreadCount").lean()
          : updatedChat;

      // 🔥 MOST RELIABLE METHOD - emit to all participants via their user rooms
      for (const userId of chat.participants) {
        console.log("FORCE EMIT TO USER:", userId.toString());

        io.to(userId.toString()).emit("message_received", {
          ...message.toObject(),
          chat: chatId,
        });

        io.to(userId.toString()).emit("chat_updated", {
          chatId,
          lastMessage: {
            ...message.toObject(),
            chat: chatId,
          },
          updatedAt: updatedChat?.updatedAt || new Date().toISOString(),
        });

        const userUnread =
          chatForUnread?.unreadCount?.find(
            (uc) => String(uc.user) === String(userId)
          )?.count ?? 0;

        io.to(userId.toString()).emit("unread_updated", {
          chatId,
          unreadCount: userUnread,
        });
      }

      if (typeof ack === "function") {
        ack({ ok: true, messageId: message._id?.toString() });
      }
    } catch (err) {
      console.error("SEND ERROR", err);
      if (typeof ack === "function") {
        ack({ ok: false, error: "Failed to send message" });
      }
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

      io.to(socket.user._id.toString()).emit("unread_updated", {
        chatId,
        unreadCount: 0,
      });
    } catch (err) {
      socket.emit("error", "Failed to mark read");
    }
  });
};

export { handleSendMessage, handleMarkAsRead };
