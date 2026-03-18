import chatApi from "@/apis/chat.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["access-chat"],
    mutationFn: (payload: any) => chatApi.accessChat(payload),
    onSuccess: (res) => {
      const chat = res?.data?.data;
      if (!chat?._id) {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        return;
      }

      const currentUserId = useAuthStore.getState().user?._id;

      const normalizedChat =
        chat.chatName || !currentUserId
          ? chat
          : {
              ...chat,
              chatName: chat.isGroup
                ? chat.groupName || "Group"
                : chat.participants?.find(
                    (p: any) => String(p?._id) !== String(currentUserId),
                  )?.fullName || "Unknown",
            };

      queryClient.setQueryData(["chats"], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        const id = String(normalizedChat._id);

        const existingIndex = list.findIndex(
          (c: any) => String(c?._id ?? c?.id) === id,
        );

        if (existingIndex === -1) return [normalizedChat, ...list];

        const updated = [...list];
        updated.splice(existingIndex, 1);
        return [normalizedChat, ...updated];
      });

      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useCreateGroupChat = () => {
  return useMutation({
    mutationKey: ["create-group-chat"],
    mutationFn: (payload: any) => chatApi.createGroupChat(payload),
  });
};
