import chatApi from "@/apis/chat.api";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useFetchChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await chatApi.fetchChats();
      return res.data.data;
    },
  });
};

export const useAccessChat = () => {
  return useMutation({
    mutationKey: ["access-chat"],
    mutationFn: (payload: any) => chatApi.accessChat(payload),
  });
};

export const useCreateGroupChat = () => {
  return useMutation({
    mutationKey: ["create-group-chat"],
    mutationFn: (payload: any) => chatApi.createGroupChat(payload),
  });
};
