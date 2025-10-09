import { Schema } from "mongoose";
import getModelSafely from "../helpers/getModelSafely.js";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    isGroupChat: {
      type: Boolean,
      default: false,
    },

    chatName: {
      type: String,
      trim: true,
      required: function () {
        return this.isGroupChat;
      },
    },

    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isGroupChat;
      },
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCount: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        count: {
          type: Number,
          default: 0,
          min: [0, "Unread message count cannot be negative"],
        },
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ "unreadCount.user": 1 });
chatSchema.index({ lastMessage: 1 });

// Middleware: Pre-find - Populate latestMessage and participants
chatSchema.pre(/^find/, function (next) {
  this.populate({
    path: "lastMessage",
    select: "content contentType sender createdAt messageStatus",
  }).populate({
    path: "participants",
    select: "fullName avatar isOnline",
  });
  next();
});

// Validation: Minimum 2 participants
chatSchema.pre("validate", function (next) {
  if (this.participants.length < 2) {
    next(new ApiError(400, "Minimum 2 participants are required for chat"));
  }

  if (this.isNew) {
    this.unreadCount = this.unreadCount.map((user) => ({
      user: user,
      count: 0,
    }));
  }
  next();
});

// Method: Reset unread count for a user
chatSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount = this.unreadCount.map((uc) =>
    uc.user.toString() === uc.userId.toString() ? { ...uc, count: 0 } : uc
  );
  await this.save();
};

const Chat = getModelSafely("Chat", chatSchema);
export default Chat;
