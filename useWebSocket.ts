import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const currentChatIdRef = useRef<string | null>(null);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      setConnectionState('disconnected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Join current chat if there is one
        if (currentChatIdRef.current) {
          joinChat(currentChatIdRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionState('disconnected');
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
    }
  }, [isAuthenticated, user, onConnect, onMessage, onDisconnect, onError, reconnectAttempts, reconnectInterval, getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const joinChat = useCallback((chatId: string) => {
    currentChatIdRef.current = chatId;
    if (user) {
      sendMessage({
        type: 'join_chat',
        userId: user.id,
        chatId: chatId
      });
    }
  }, [user, sendMessage]);

  const leaveChat = useCallback(() => {
    currentChatIdRef.current = null;
  }, []);

  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (user) {
      sendMessage({
        type: 'typing',
        userId: user.id,
        chatId: chatId,
        isTyping
      });
    }
  }, [user, sendMessage]);

  // Connect when authenticated, disconnect when not
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    joinChat,
    leaveChat,
    sendTyping,
    connect,
    disconnect,
  };
}