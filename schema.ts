import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat types enum
export const chatTypeEnum = pgEnum("chat_type", ["direct", "group", "ai_bot"]);

// Message status enum  
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

// Chats table
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }),
  type: chatTypeEnum("type").notNull().default("direct"),
  createdBy: varchar("created_by").references(() => users.id),
  isAiBot: boolean("is_ai_bot").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat participants table (many-to-many relationship)
export const chatParticipants = pgTable("chat_participants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isFromAi: boolean("is_from_ai").default(false),
  status: messageStatusEnum("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chatParticipants: many(chatParticipants),
  messages: many(messages),
  createdChats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  participants: many(chatParticipants),
  messages: many(messages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertChatSchema = createInsertSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);
export const insertChatParticipantSchema = createInsertSchema(chatParticipants);

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;
