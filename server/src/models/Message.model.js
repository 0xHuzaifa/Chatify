import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
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

    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 }); // sort messages by time
messageSchema.index({ status: 1 }); // fast status based queries
messageSchema.index({ "reactions.user": 1 }); // fast reaction queries

const Message = mongoose.model("Message", messageSchema);
export default Message;
