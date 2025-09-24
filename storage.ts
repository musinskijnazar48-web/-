import {
  type User,
  type UpsertUser,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type ChatParticipant,
  type InsertChatParticipant,
  users,
  chats,
  messages,
  chatParticipants,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getUserChats(userId: string): Promise<Array<Chat & { lastMessage?: Message; unreadCount: number }>>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  getChatParticipants(chatId: string): Promise<Array<ChatParticipant & { user: User }>>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getChatMessages(chatId: string, limit?: number): Promise<Array<Message & { sender: User }>>;
  updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chat operations
  async createChat(chatData: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(chatData).returning();
    return chat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async getUserChats(userId: string): Promise<Array<Chat & { lastMessage?: Message; unreadCount: number }>> {
    const userChats = await db
      .select({
        chat: chats,
        lastMessage: messages,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .leftJoin(
        messages,
        and(
          eq(chats.id, messages.chatId),
          // Get the most recent message for each chat
        )
      )
      .where(eq(chatParticipants.userId, userId))
      .orderBy(desc(chats.updatedAt));

    // TODO: Implement proper unread count logic
    return userChats.map(({ chat, lastMessage }) => ({
      ...chat,
      lastMessage: lastMessage || undefined,
      unreadCount: 0,
    }));
  }

  async addChatParticipant(participantData: InsertChatParticipant): Promise<ChatParticipant> {
    const [participant] = await db.insert(chatParticipants).values(participantData).returning();
    return participant;
  }

  async getChatParticipants(chatId: string): Promise<Array<ChatParticipant & { user: User }>> {
    const participants = await db
      .select({
        participant: chatParticipants,
        user: users,
      })
      .from(chatParticipants)
      .innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chatParticipants.chatId, chatId));

    return participants.map(({ participant, user }) => ({
      ...participant,
      user,
    }));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getChatMessages(chatId: string, limit: number = 50): Promise<Array<Message & { sender: User }>> {
    const chatMessages = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);

    return chatMessages.map(({ message, sender }) => ({
      ...message,
      sender,
    }));
  }

  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void> {
    await db
      .update(messages)
      .set({ status, updatedAt: new Date() })
      .where(eq(messages.id, messageId));
  }
}

export const storage = new DatabaseStorage();
