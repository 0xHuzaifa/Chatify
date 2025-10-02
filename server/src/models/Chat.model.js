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

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
