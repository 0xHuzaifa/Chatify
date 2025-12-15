import api from "@/lib/axios/axios-instance";

const messageApi = {
  getAllMessages: (chatId: string, cursor?: string | null, limit?: number) =>
    api.get(`/message/${chatId}`, {
      params: { cursor: cursor ?? null, limit: limit ?? undefined },
    }),

  sendMessage: (formData: FormData) =>
    api.post("/message/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default messageApi;
