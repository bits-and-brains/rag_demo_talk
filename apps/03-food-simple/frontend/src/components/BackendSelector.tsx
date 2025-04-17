import React from 'react';

interface BackendSelectorProps {
  currentBackend: string;
  onBackendChange: (backend: string) => void;
}

const BackendSelector: React.FC<BackendSelectorProps> = ({
  currentBackend,
  onBackendChange,
}) => {
  const backends = [
    { id: 'php', name: 'PHP Backend' },
    { id: 'nodejs', name: 'Node.js Backend' },
    { id: 'python', name: 'Python Backend' },
    { id: 'golang', name: 'Golang Backend' },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {backends.map((backend) => (
        <button
          key={backend.id}
          onClick={() => onBackendChange(backend.id)}
          className={`px-3 py-1 rounded ${
            currentBackend === backend.id
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {backend.name}
        </button>
      ))}
    </div>
  );
};

export default BackendSelector; 