import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    chatType: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    groupName: {
      // Only for group chats
      type: String,
    },

    groupAvatar: {
      // Only for group chats
      type: String,
    },

    admins: [
      // Only for group chats
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCount: {
      type: Map,
      of: Number, // key: userId, value: unread count
      default: {},
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
