'use client';

type Message = { role: 'user' | 'assistant'; content: string };

export default function InterviewChat({ messages, loading }: { 
  messages: Message[];
  loading: boolean;
}) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {messages.map((m, i) => (
        <div key={i} className={`p-4 rounded-lg ${
          m.role === 'assistant'
            ? 'bg-blue-900 border border-blue-700'
            : 'bg-gray-800'
        }`}>
          <span className="text-xs text-gray-400 font-semibold">
            {m.role === 'assistant' ? '🤖 Interviewer' : '👤 You'}
          </span>
          <p className="mt-1 text-sm leading-relaxed">{m.content}</p>
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 p-4">
          <span className="animate-pulse">●</span>
          <span className="animate-pulse delay-100">●</span>
          <span className="animate-pulse delay-200">●</span>
          <span className="ml-1 text-sm">Interviewer is thinking...</span>
        </div>
      )}
    </div>
  );
}