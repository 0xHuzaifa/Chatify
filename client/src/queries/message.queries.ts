import messageApi from "@/apis/message.api";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGetMessages = (
  chatId?: string | null,
  cursor?: string | null,
  limit = 20
) => {
  return useQuery({
    queryKey: ["messages", chatId, cursor, limit],
    enabled: !!chatId,
    queryFn: async () => {
      const res = await messageApi.getAllMessages(
        chatId as string,
        cursor,
        limit
      );
      return res.data.data;
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationKey: ["send-message"],
    mutationFn: (formData: FormData) => messageApi.sendMessage(formData),
  });
};
