export type LLMProvider = 'openai' | 'gemini' | 'ollama'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatResponse {
  message: string
  error?: string
}

export interface ProviderInfo {
  id: LLMProvider
  name: string
  description: string
}

export interface ChatProps {
  selectedProvider: LLMProvider
}

export interface HeaderProps {
  selectedProvider: LLMProvider
  onProviderChange: (provider: LLMProvider) => void
} 