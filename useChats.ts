import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Chat, Message, User } from '@shared/schema';

export interface ChatWithDetails extends Chat {
  lastMessage?: Message;
  unreadCount: number;
}

export interface MessageWithSender extends Message {
  sender: User;
}

export function useChats() {
  return useQuery<ChatWithDetails[]>({
    queryKey: ['/api/chats'],
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatData: { name: string; isAiBot?: boolean }) => {
      return await apiRequest('/api/chats', {
        method: 'POST',
        body: JSON.stringify(chatData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
  });
}

export function useChat(chatId: string) {
  return useQuery<Chat>({
    queryKey: ['/api/chats', chatId],
    enabled: !!chatId,
  });
}

export function useChatMessages(chatId: string, limit: number = 50) {
  return useQuery<MessageWithSender[]>({
    queryKey: ['/api/chats', chatId, 'messages'],
    enabled: !!chatId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: string; content: string }) => {
      return await apiRequest(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', variables.chatId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
  });
}