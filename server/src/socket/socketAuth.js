import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Helper function to parse cookies from cookie string
const parseCookies = (cookieString) => {
  if (!cookieString) return {};

  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
  });
  return cookies;
};

const socketAuth = async (socket, next) => {
  try {
    // Get token from cookies (sent automatically with withCredentials: true)
    const cookieString = socket.handshake.headers.cookie;
    const cookies = parseCookies(cookieString);
    const token = cookies.accessToken;

    if (!token) {
      console.log("Socket auth failed: No access token in cookies");
      console.log("Cookies received:", cookieString);
      return next(new Error("Authentication token missing"));
    }

    // Use JWT_ACCESS_TOKEN_SECRET since we're using the same access token from cookies
    const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    const user = await User.findById(decode.id)
      .select("_id fullName avatar")
      .lean();

    if (!user) {
      return next(new Error("Invalid authentication token"));
    }

    socket.user = user; // attach user object to socket
    console.log(
      `Socket authenticated for user: ${user._id} (${user.fullName})`
    );
    next();
  } catch (error) {
    console.error("Socket auth error:", error.name, error.message);
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid authentication token"));
    } else if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication token expired"));
    }
    return next(new Error(`Socket authentication failed: ${error.message}`));
  }
};

export default socketAuth;
