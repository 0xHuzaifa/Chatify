import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { text: String, mediaUrl: String },

    contentType: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },

    messageStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
