import api from "@/lib/axios/axios-instance";

const messageApi = {
  getAllMessages: (chatId: string, cursor?: string | null, limit?: number) =>
    api.get(`/message/${chatId}`, {
      params: { cursor: cursor ?? null, limit: limit ?? undefined },
    }),

  sendMessage: (payload: { chatId: string; content: string }) =>
    api.post("/message/send", payload),
};

export default messageApi;
