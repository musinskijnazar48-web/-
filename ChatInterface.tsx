import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, VideoIcon, Search } from "lucide-react";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  message: string;
  sender: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isOwn?: boolean;
  isAI?: boolean;
  status?: "sent" | "delivered" | "read";
}

interface ChatInterfaceProps {
  chat?: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    isAI?: boolean;
    lastSeen?: string;
  };
  messages: Message[];
  onSendMessage: (message: string) => void;
  className?: string;
}

const ChatInterface = ({ chat, messages, onSendMessage, className }: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    onSendMessage(message);
    
    // todo: remove mock functionality
    // Simulate AI typing indicator for AI chats
    if (chat?.isAI) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  if (!chat) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-background", className)}>
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Выберите чат</h3>
          <p className="text-sm">Чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={chat.name}
            avatar={chat.avatar}
            isOnline={chat.isOnline}
            className={cn(chat.isAI && "ring-2 ring-chart-3/30")}
          />
          <div>
            <h3 className="font-medium text-foreground">{chat.name}</h3>
            <p className="text-sm text-muted-foreground">
              {chat.isOnline ? (
                "в сети"
              ) : (
                chat.lastSeen || "был(а) недавно"
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            data-testid="button-search-chat"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {!chat.isAI && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                data-testid="button-voice-call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                data-testid="button-video-call"
              >
                <VideoIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            data-testid="button-chat-options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Начните общение!</p>
          </div>
        )}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserAvatar 
              name={chat.name} 
              avatar={chat.avatar} 
              size="sm"
              className={cn(chat.isAI && "ring-2 ring-chart-3/30")}
            />
            <div className="bg-muted rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatInterface;