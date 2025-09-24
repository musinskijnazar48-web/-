import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = ({ onSend, placeholder = "Введите сообщение...", disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 shrink-0"
          data-testid="button-attach"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="resize-none min-h-[40px] max-h-32 pr-12"
            disabled={disabled}
            data-testid="input-message"
          />
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 h-6 w-6"
            data-testid="button-emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-9 w-9 shrink-0"
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;