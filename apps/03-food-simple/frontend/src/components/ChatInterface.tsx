import React, { useState, useEffect, useRef } from 'react';
import BackendSelector from './BackendSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Provider {
  name: string;
  enabled: boolean;
  model: string | null;
  supportsEmbeddingSelection?: boolean;
  requiresEmbedding?: boolean;
  returnsContent?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, Provider>>({});
  const [vectorSearchProviders, setVectorSearchProviders] = useState<Record<string, Provider>>({});
  const [currentProvider, setCurrentProvider] = useState('ollama');
  const [currentEmbeddingModel, setCurrentEmbeddingModel] = useState('ollama');
  const [currentVectorSearchProvider, setCurrentVectorSearchProvider] = useState('qdrant');
  const [currentBackend, setCurrentBackend] = useState('nodejs');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const phpApiUrl = import.meta.env.VITE_PHP_API_URL || 'http://localhost:8010';
  const nodeApiUrl = import.meta.env.VITE_NODE_API_URL || 'http://localhost:8011';
  const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8012';
  const golangApiUrl = import.meta.env.VITE_GOLANG_API_URL || 'http://localhost:8013';

  const apiUrl = currentBackend === 'php'
    ? phpApiUrl
    : currentBackend === 'nodejs'
      ? nodeApiUrl
      : currentBackend === 'python'
        ? pythonApiUrl
        : golangApiUrl;

  // Fetch providers when component mounts
  useEffect(() => {
    fetchProviders();
    fetchEmbeddingModels();
    fetchVectorSearchProviders();
  }, []);

  // Fetch providers when backend changes
  useEffect(() => {
    fetchProviders();
    fetchEmbeddingModels();
    fetchVectorSearchProviders();
  }, [currentBackend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/providers`);
      const data = await response.json();
      setProviders(data.providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchEmbeddingModels = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/embedding-models`);
      const data = await response.json();
      setEmbeddingModels(data.models);
    } catch (error) {
      console.error('Error fetching embedding models:', error);
    }
  };

  const fetchVectorSearchProviders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/vector-search-providers`);
      const data = await response.json();
      setVectorSearchProviders(data.providers);
    } catch (error) {
      console.error('Error fetching vector search providers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          provider: currentProvider,
          embeddingModel: currentVectorSearchProvider === 'qdrant' ? currentEmbeddingModel : undefined,
          vectorSearchProvider: currentVectorSearchProvider,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error || 'Failed to get response'}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Error: Failed to connect to the server',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (provider: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/switch-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        setCurrentProvider(provider);
        setMessages([]); // Clear messages when switching providers
      } else {
        console.error('Failed to switch provider');
      }
    } catch (error) {
      console.error('Error switching provider:', error);
    }
  };

  const handleEmbeddingModelChange = (model: string) => {
    setCurrentEmbeddingModel(model);
    setMessages([]); // Clear messages when switching embedding models
  };

  const handleVectorSearchProviderChange = (provider: string) => {
    setCurrentVectorSearchProvider(provider);
    setMessages([]); // Clear messages when switching vector search providers
  };

  const handleBackendChange = (backend: string) => {
    setCurrentBackend(backend);
    setMessages([]); // Clear messages when switching backends
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Check if the current vector search provider supports embedding model selection
  const showEmbeddingModelSelection = currentVectorSearchProvider === 'qdrant';

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Simple Food search</h1>
          <button
            onClick={handleClearChat}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Chat
          </button>
        </div>
        <BackendSelector
          currentBackend={currentBackend}
          onBackendChange={handleBackendChange}
        />
        
        {/* LLM Provider Selection */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-1">LLM Provider:</h3>
          <div className="flex space-x-2">
            {Object.entries(providers).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => handleProviderChange(key)}
                className={`px-3 py-1 rounded ${
                  currentProvider === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                disabled={!provider.enabled}
                title={provider.enabled ? `Model: ${provider.model || 'Unknown'}` : 'Provider not available'}
              >
                {provider.name}
                {provider.enabled && provider.model && (
                  <div className="text-xs mt-1 opacity-80">
                    {provider.model}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Vector Search Provider Selection */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-1">Vector Search Provider:</h3>
          <div className="flex space-x-2">
            {Object.entries(vectorSearchProviders).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => handleVectorSearchProviderChange(key)}
                className={`px-3 py-1 rounded ${
                  currentVectorSearchProvider === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                disabled={!provider.enabled}
                title={provider.enabled ? `Provider: ${provider.name}` : 'Provider not available'}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Embedding Model Selection - Only shown for Qdrant */}
        {showEmbeddingModelSelection && (
          <div className="mb-2">
            <h3 className="text-sm font-semibold mb-1">Embedding Model:</h3>
            <div className="flex space-x-2">
              {Object.entries(embeddingModels).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => handleEmbeddingModelChange(key)}
                  className={`px-3 py-1 rounded ${
                    currentEmbeddingModel === key
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  disabled={!model.enabled}
                  title={model.enabled ? `Model: ${model.model || 'Unknown'}` : 'Model not available'}
                >
                  {model.name}
                  {model.enabled && model.model && (
                    <div className="text-xs mt-1 opacity-80">
                      {model.model}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-white'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}:
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
