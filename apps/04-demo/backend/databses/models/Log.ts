/**
 * Type representing the possible log severity levels
 */
export type LogSeverity = "info" | "warning" | "error" | "debug";

/**
 * Interface representing a log entry
 */
export interface Log {
  id: number;
  content: string;
  logger: string;
  severity: LogSeverity;
  created_at: Date;
} 