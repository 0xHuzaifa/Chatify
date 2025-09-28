import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const userVerificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  OTP: {
    type: String,
  },

  link: {
    type: String,
  },

  expiry: {
    type: Date,
  },
});

// TTL index to auto-delete expired documents
userVerificationSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

userVerificationSchema.methods.generateVerificationLink = async function () {
  const link = crypto.randomBytes(32).toString("hex");
  const hashedLink = crypto.createHash("sha256").update(link).digest("hex");
  this.link = hashedLink;
  this.expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  await this.save();
  return link;
};

userVerificationSchema.methods.verifyLink = async function (link) {
  const currentTime = new Date();
  if (currentTime > this.expiry) {
    return false; // Token has expired
  }
  const hashedLink = crypto.createHash("sha256").update(link).digest("hex");
  return hashedLink === this.link;
};

userVerificationSchema.methods.generateOTP = async function () {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const hashedOTP = crypto.createHash("sha256").update(result).digest("hex");
  this.OTP = hashedOTP;
  this.OTP = result;
  this.expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  await this.save();
  return result;
};

userVerificationSchema.methods.verifyOTP = async function (otp) {
  const currentTime = new Date();
  if (currentTime > this.expiry) {
    return false; // OTP has expired
  }
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  return hashedOTP === this.OTP;
};

// Static method to clean up expired records (optional, since TTL index handles this)
userVerificationSchema.static.cleanupExpired = function () {
  return this.deleteMany({ verificationExpireAt: { $lt: new Date() } });
};
export default mongoose.model("UserVerification", userVerificationSchema);
