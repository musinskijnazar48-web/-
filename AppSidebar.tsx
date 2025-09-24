import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import ChatSidebar from "./ChatSidebar";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  isOnline?: boolean;
  isAI?: boolean;
  unread?: number;
}

interface AppSidebarProps {
  chats: Chat[];
  activeChat?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

const AppSidebar = ({ chats, activeChat, onChatSelect, onNewChat }: AppSidebarProps) => {
  return (
    <Sidebar>
      <SidebarContent className="p-0">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={onChatSelect}
          onNewChat={onNewChat}
        />
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;