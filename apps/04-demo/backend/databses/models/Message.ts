/**
 * Type representing the possible message authors
 */
export type MessageAuthor = "user" | "assistant";

/**
 * Interface representing a chat message
 */
export interface Message {
  id: number;
  content: string;
  author: MessageAuthor;
  created_at: Date;
} 