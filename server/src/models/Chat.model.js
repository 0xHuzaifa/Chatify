import { Schema } from "mongoose";
import getModelSafely from "../helpers/getModelSafely.js";
import ApiError from "../utils/ApiError.js";

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupName: {
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

chatSchema.index({ participants: 1, isGroupChat: 1 });
chatSchema.index({ "unreadCount.user": 1 });
chatSchema.index({ lastMessage: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ groupAdmin: 1 });

// Validation: Minimum 2 participants
chatSchema.pre("validate", function (next) {
  if (this.participants.length < 2) {
    return next(
      new ApiError(400, "Minimum 2 participants are required for chat")
    );
  }

  if (this.isNew) {
    this.unreadCount = this.participants.map((user) => ({
      user,
      count: 0,
    }));
  }
  next();
});

// Method: Reset unread count for a user
chatSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount = this.unreadCount.map((uc) =>
    uc.user.toString() === userId.toString() ? { ...uc, count: 0 } : uc
  );
  await this.save();
};

const Chat = getModelSafely("Chat", chatSchema);
export default Chat;
