import api from "@/lib/axios/axios-instance";

const chatApi = {
  fetchChats: () => api.get("/chat/fetch-chats"),
  accessChat: (payload: any) => api.post("/chat/access-chat", payload),
  createGroupChat: (payload: any) => api.post("/chat/create-group", payload),
};

export default chatApi;
