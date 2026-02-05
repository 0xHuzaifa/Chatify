  import { handleJoinChat, handleTyping } from "../handlers/chat.handler.js";

  export default function chatEvents(io, socket) {
    handleJoinChat(io, socket);
    handleTyping(io, socket);
  }
