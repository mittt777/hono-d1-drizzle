import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Helper function to generate UUID
const generateUUID = sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`;

export const users = sqliteTable('users', {
  // UUID for the user
  id: text('id').primaryKey().default(generateUUID),
  // User's email address, must be unique
  email: text('email', { length: 256 }).notNull().unique(),
  // User's full name
  name: text('name', { length: 256 }).notNull(),
  // Timestamp when the user account was created
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const posts = sqliteTable('posts', {
  // UUID for the post
  id: text('id').primaryKey().default(generateUUID),
  // Reference to the user who created this post
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  // Title of the post
  title: text('title', { length: 256 }).notNull(),
  // Main content of the post
  content: text('content').notNull(),
  // Timestamp when the post was created
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const comments = sqliteTable('comments', {
  // UUID for the comment
  id: text('id').primaryKey().default(generateUUID),
  // Reference to the user who wrote this comment
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  // Reference to the post this comment belongs to
  postId: text('post_id')
    .notNull()
    .references(() => posts.id),
  // Content of the comment
  content: text('content').notNull(),
  // Timestamp when the comment was created
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
