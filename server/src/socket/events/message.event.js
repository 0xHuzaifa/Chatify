import { handleSendMessage } from "../handlers/message.handler.js";

export default function messageEvents(io, socket) {
  handleSendMessage(io, socket);
}
