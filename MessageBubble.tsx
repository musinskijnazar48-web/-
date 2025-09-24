import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Bot, Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
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

const MessageBubble = ({ message, sender, timestamp, isOwn = false, isAI = false, status }: MessageBubbleProps) => {
  return (
    <div className={cn(
      "flex gap-2 max-w-[85%] mb-3",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {!isOwn && (
        <UserAvatar 
          name={sender.name} 
          avatar={sender.avatar} 
          size="sm" 
          className={cn(isAI && "ring-2 ring-chart-3/30")}
        />
      )}
      
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-medium text-foreground">
              {sender.name}
            </span>
            {isAI && <Bot className="h-3 w-3 text-chart-3" />}
          </div>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-2 max-w-sm break-words",
          isOwn 
            ? "bg-primary text-primary-foreground" 
            : isAI 
              ? "bg-chart-3/10 border border-chart-3/20" 
              : "bg-muted"
        )}>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isOwn && status && (
            <div className="text-muted-foreground">
              {status === "sent" && <Check className="h-3 w-3" />}
              {status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;