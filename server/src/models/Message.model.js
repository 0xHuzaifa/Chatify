import { Schema } from "mongoose";
import ApiError from "../utils/ApiError.js";
import Chat from "./Chat.model.js";
import getModelSafely from "../helpers/getModelSafely.js";

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

    content: {
      type: String,
      trim: true,
      default: "", // Empty string for text-only or file-only messages
    },

    fileUrl: {
      type: String,
      trim: true,
      default: "", // Cloudinary URL for file (image, video, file)
    },

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

    deletedAt: {
      type: Date,
      default: null, // Soft delete
    },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, _id: 1 });
messageSchema.index({ chat: 1, createdAt: -1 }); // sort messages by time
messageSchema.index({ messageStatus: 1 }); // fast messageStatus based queries
messageSchema.index({ "reactions.user": 1 }); // fast reaction queries

// Validation: At least one of content or fileUrl must be present
messageSchema.pre("validate", function (next) {
  if (!this.content && !this.fileUrl) {
    throw new ApiError(400, "Message must have either content or a file URL.");
  }
  next();
});

// Middleware: Post-save - Update Chat's latestMessage and unread counts
messageSchema.post("save", async function (doc) {
  try {
    // Update Chat's latestMessage
    await Chat.findByIdAndUpdate(doc.chat, { lastMessage: doc._id });

    // Update unread counts for participants
    if (doc.messageStatus !== "read") {
      await Chat.updateOne(
        { _id: doc.chat },
        { $inc: { "unreadCount.$[elem].count": 1 } },
        { arrayFilters: [{ "elem.user": { $ne: doc.sender } }] }
      );
    }
  } catch (error) {
    console.error("Error updating chat after message save:", error);
  }
});

// Middleware: Pre-find - Hide deleted messages
messageSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null })
    .populate("sender", "fullName avatar")
    .populate("reactions.user", "fullName avatar");

  next();
});

// Method: Add reaction
messageSchema.methods.addReaction = async function (userId, emoji) {
  if (!this.reactions.find((r) => r.user.toString() === userId.toString())) {
    this.reactions.push({ user: userId, emoji });
    await this.save();
  }
};

// Method: Update status
messageSchema.methods.updateStatus = async function (userId, status) {
  if (["sent", "delivered", "read"].includes(status)) {
    this.status = status;

    if (status === "read" && !this.readBy.includes(userId)) {
      this.readBy.push(userId);
    }

    await this.save();
  }
};

const Message = getModelSafely("Message", messageSchema);
export default Message;
