import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import ChatInterface from "./ChatInterface";
import LoginForm from "./LoginForm";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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

const MessengerApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeChat, setActiveChat] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string } | null>(null);
  
  // todo: remove mock functionality
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Анна Сидорова',
      lastMessage: 'Привет! Как дела?',
      timestamp: '14:30',
      isOnline: true,
      unread: 2
    },
    {
      id: '2',
      name: 'Михаил Козлов',
      lastMessage: 'Увидимся завтра',
      timestamp: 'вчера',
      isOnline: false
    },
    {
      id: '3',
      name: 'ИИ Помощник',
      lastMessage: 'Я готов помочь вам с любыми вопросами',
      timestamp: '12:00',
      isAI: true,
      unread: 1
    },
    {
      id: '4',
      name: 'Рабочая группа',
      lastMessage: 'Отлично, договорились',
      timestamp: 'пн',
      isOnline: false
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      message: 'Привет! Как дела?',
      sender: { name: 'Анна Сидорова' },
      timestamp: '14:30',
      isOwn: false
    },
    {
      id: '2',
      message: 'Привет! У меня всё отлично, спасибо!',
      sender: { name: 'Я' },
      timestamp: '14:32',
      isOwn: true,
      status: 'read'
    }
  ]);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = () => {
      // todo: remove mock functionality  
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        setActiveChat('1'); // Auto-select first chat for demo
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (credentials: { email?: string; phone?: string; password: string }) => {
    console.log('Вход пользователя:', credentials);
    // todo: remove mock functionality
    const user = {
      name: 'Иван Петров',
      email: credentials.email || credentials.phone
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setActiveChat('1');
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    console.log('Социальный вход через:', provider);
    // todo: remove mock functionality
    const user = {
      name: 'Иван Петров',
      email: `user@${provider}.com`
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setActiveChat('1');
  };

  const handleChatSelect = (chatId: string) => {
    console.log('Выбран чат:', chatId);
    setActiveChat(chatId);
  };

  const handleNewChat = () => {
    console.log('Создание нового чата');
  };

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      sender: { name: currentUser?.name || 'Я' },
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    console.log('Отправка сообщения:', message);

    // todo: remove mock functionality
    // Simulate AI response for AI chat
    const activeAIChat = chats.find(chat => chat.id === activeChat && chat.isAI);
    if (activeAIChat) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          message: `Я понял ваш вопрос: "${message}". Как ИИ-ассистент, я готов помочь!`,
          sender: { name: activeAIChat.name },
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          isAI: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveChat(undefined);
    localStorage.removeItem('currentUser');
  };

  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onSocialLogin={handleSocialLogin} 
      />
    );
  }

  const style = {
    "--sidebar-width": "20rem",       // 320px for better content
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  const selectedChat = chats.find(chat => chat.id === activeChat);

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
        
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-3 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="font-semibold text-lg">Телеграм Чат</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                data-testid="button-settings"
                className="h-9 w-9"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-hidden">
            <ChatInterface
              chat={selectedChat ? {
                ...selectedChat,
                lastSeen: selectedChat.isOnline ? undefined : 'был(а) 2 часа назад'
              } : undefined}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MessengerApp;