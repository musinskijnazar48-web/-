import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAiResponse, generateAiResponseStream } from "./openai";
import { insertMessageSchema, insertChatSchema } from "@shared/schema";
import { z } from "zod";

interface AuthenticatedUser {
  claims: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  chatId?: string;
}

const connectedClients = new Map<string, ConnectedClient>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat routes
  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const chat = await storage.createChat(validatedData);
      
      // Add creator as participant
      await storage.addChatParticipant({
        chatId: chat.id,
        userId: userId,
        isAdmin: true,
      });
      
      res.json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get('/api/chats/:chatId', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const chat = await storage.getChat(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  // Message routes
  app.get('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(chatId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chatId } = req.params;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      const validatedData = insertMessageSchema.parse({
        chatId,
        senderId: userId,
        content: content.trim(),
        isFromAi: false,
      });
      
      const message = await storage.createMessage(validatedData);
      const messageWithSender = await storage.getChatMessages(chatId, 1);
      const fullMessage = messageWithSender[messageWithSender.length - 1];
      
      // Broadcast to WebSocket clients in this chat
      broadcastToChat(chatId, {
        type: 'new_message',
        message: fullMessage,
      });
      
      // Check if this is an AI bot chat and generate response
      const chat = await storage.getChat(chatId);
      if (chat?.isAiBot) {
        setTimeout(async () => {
          try {
            // Get recent conversation history for context
            const recentMessages = await storage.getChatMessages(chatId, 10);
            const conversationHistory = recentMessages.slice(-5).map(msg => ({
              role: msg.isFromAi ? 'assistant' as const : 'user' as const,
              content: msg.content,
            }));
            
            const aiResponse = await generateAiResponse(content, conversationHistory);
            
            const aiMessageData = insertMessageSchema.parse({
              chatId,
              senderId: userId, // AI uses same user ID for now
              content: aiResponse,
              isFromAi: true,
            });
            
            const aiMessage = await storage.createMessage(aiMessageData);
            const aiMessageWithSender = await storage.getChatMessages(chatId, 1);
            const fullAiMessage = aiMessageWithSender[aiMessageWithSender.length - 1];
            
            broadcastToChat(chatId, {
              type: 'new_message', 
              message: fullAiMessage,
            });
          } catch (error) {
            console.error('AI response error:', error);
          }
        }, 1000);
      }
      
      res.json(fullMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // AI streaming route
  app.post('/api/chats/:chatId/ai-stream', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      
      const chat = await storage.getChat(chatId);
      if (!chat?.isAiBot) {
        return res.status(400).json({ message: "This is not an AI bot chat" });
      }
      
      const recentMessages = await storage.getChatMessages(chatId, 10);
      const conversationHistory = recentMessages.slice(-5).map(msg => ({
        role: msg.isFromAi ? 'assistant' as const : 'user' as const,
        content: msg.content,
      }));
      
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      
      const stream = await generateAiResponseStream(content, conversationHistory);
      const reader = stream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          res.write(value);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } catch (error) {
      console.error("AI streaming error:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_chat') {
          const { userId, chatId } = message;
          connectedClients.set(userId, { ws, userId, chatId });
          console.log(`User ${userId} joined chat ${chatId}`);
        }
        
        if (message.type === 'typing') {
          const { userId, chatId, isTyping } = message;
          broadcastToChat(chatId, {
            type: 'user_typing',
            userId,
            isTyping,
          }, userId);
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from connected clients
      for (const [userId, client] of Array.from(connectedClients.entries())) {
        if (client.ws === ws) {
          connectedClients.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  function broadcastToChat(chatId: string, message: any, excludeUserId?: string) {
    for (const [userId, client] of Array.from(connectedClients.entries())) {
      if (client.chatId === chatId && 
          userId !== excludeUserId && 
          client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  return httpServer;
}
