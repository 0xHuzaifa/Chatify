import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      throw new ApiError(404, "Socket authentication token missing");
    }

    const decode = jwt.verify(token, process.env.JWT_SOCKET_TOKEN_SECRET);

    const user = await User.findById(decode.id)
      .select("_id fullName avatar")
      .lean();

    if (!user) {
      throw new ApiError("Invalid token");
    }

    socket.user = user; // attach user object to socket
    next();
  } catch (error) {
    throw new ApiError(500, "Socket authentication failed");
  }
};

export default socketAuth;
