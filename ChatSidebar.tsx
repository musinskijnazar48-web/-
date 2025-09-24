import { Search, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "./UserAvatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

interface ChatSidebarProps {
  chats: Chat[];
  activeChat?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

const ChatSidebar = ({ chats, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-r bg-sidebar h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sidebar-foreground">Чаты</h2>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onNewChat}
              data-testid="button-new-chat"
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              data-testid="button-more"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-chats"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover-elevate transition-colors",
                activeChat === chat.id && "bg-sidebar-accent"
              )}
              data-testid={`chat-item-${chat.id}`}
            >
              <UserAvatar
                name={chat.name}
                avatar={chat.avatar}
                isOnline={chat.isOnline}
                className={cn(chat.isAI && "ring-2 ring-chart-3/30")}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sidebar-foreground truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {chat.timestamp}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unread && chat.unread > 0 && (
                    <div className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium min-w-[20px] text-center">
                      {chat.unread > 99 ? "99+" : chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;