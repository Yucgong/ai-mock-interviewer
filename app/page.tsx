'use client';
import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import InterviewChat from './components/InterviewChat';
import FeedbackPanel from './components/FeedbackPanel';

type Message = { role: 'user' | 'assistant'; content: string };
type FeedbackEntry = { question: string; answer: string; feedback: string };

export default function Home() {
  const [role, setRole] = useState('Software Engineer');
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const askQuestion = async (history: Message[]) => {
    setLoading(true);
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, role, mode: 'question' }),
    });
    const { reply } = await res.json();
    const updated: Message[] = [...history, { role: 'assistant', content: reply }];
    setMessages(updated);
    setQuestionCount(prev => prev + 1);
    setLoading(false);
    return updated;
  };

  const handleStart = async () => {
    setStarted(true);
    setMessages([]);
    setFeedbackHistory([]);
    setQuestionCount(0);
    await askQuestion([]);
  };

  const handleAnswer = async (text: string) => {
    if (!text.trim()) return;

    const withAnswer: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(withAnswer);
    setLoading(true);

    try {
      // Step 1: Get feedback
      const fbRes = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: withAnswer, role, mode: 'feedback' }),
      });
      const fbData = await fbRes.json();
      const fb = fbData.reply;

      // Step 2: Save to feedback history
      const lastQuestion = messages[messages.length - 1];
      setFeedbackHistory(prev => [...prev, {
        question: lastQuestion?.content || '',
        answer: text,
        feedback: fb,
      }]);
      setLoading(false);

      // Step 3: Pause so user can read feedback
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Step 4: Ask next question with trimmed history
      const trimmedHistory: Message[] = [
        {
          role: 'user',
          content: `Previous question was: "${lastQuestion?.content}". My answer was: "${text}". Please ask me the next interview question.`
        }
      ];

      setLoading(true);
      await askQuestion(trimmedHistory);

    } catch (err) {
      console.error('handleAnswer error:', err);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setMessages([]);
    setFeedbackHistory([]);
    setQuestionCount(0);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">🎙 AI Mock Interviewer</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Practice interviews with real-time AI feedback
            </p>
          </div>
          {started && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Questions asked</p>
              <p className="text-2xl font-bold text-blue-400">{questionCount}</p>
            </div>
          )}
        </div>

        {/* Setup Screen */}
        {!started ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Set up your interview</h2>
              <p className="text-gray-400 text-sm">
                Enter the role you're interviewing for, then start when ready.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Job Role</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white
                  placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Software Engineer, Product Manager, Data Scientist"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={!role.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg font-bold
                transition-colors text-white"
            >
              Start Interview →
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Role badge + reset */}
            <div className="flex items-center justify-between">
              <span className="text-sm bg-blue-900 text-blue-300 border border-blue-700
                px-3 py-1 rounded-full">
                🧑‍💼 {role}
              </span>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                ✕ End Session
              </button>
            </div>

            {/* Current interview chat */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <InterviewChat messages={messages} loading={loading} />
            </div>

            {/* Feedback History */}
            {feedbackHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Feedback History
                </h3>
                {feedbackHistory.map((item, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
                    <span className="text-xs text-blue-400 font-semibold">Question {i + 1}</span>
                    <p className="text-sm text-gray-300 italic">"{item.question}"</p>
                    <p className="text-sm text-gray-400">
                      <span className="text-white font-medium">Your answer: </span>
                      {item.answer}
                    </p>
                    <FeedbackPanel feedback={item.feedback} />
                  </div>
                ))}
              </div>
            )}

            {/* Recording */}
            {!loading && messages.length > 0 && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-400">Record your answer when you're ready</p>
                <AudioRecorder onTranscript={handleAnswer} />
              </div>
            )}

            {loading && (
              <p className="text-center text-sm text-gray-500 animate-pulse">
                Processing...
              </p>
            )}

          </div>
        )}
      </div>
    </main>
  );
}