'use client';
import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import InterviewChat from './components/InterviewChat';
import FeedbackPanel from './components/FeedbackPanel';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const [role, setRole] = useState('Software Engineer');
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const askQuestion = async (history: Message[]) => {
    setLoading(true);
    setFeedback('');
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
    setFeedback('');
    setQuestionCount(0);
    await askQuestion([]);
  };

  const handleAnswer = async (text: string) => {
    if (!text.trim()) return;
  
    const withAnswer: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(withAnswer);
    setLoading(true);
    setFeedback('');
  
    try {
      // Step 1: Get feedback
      const fbRes = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: withAnswer, role, mode: 'feedback' }),
      });
      const fbData = await fbRes.json();
      const fb = fbData.reply;
  
      // Step 2: Show feedback, stop loading so user can read it
      setFeedback(fb);
      setLoading(false);
  
      // Step 3: Wait 4 seconds so user can read feedback before next question loads
      await new Promise(resolve => setTimeout(resolve, 4000));
  
      // Step 4: Ask next question with trimmed history
      const lastQuestion = messages[messages.length - 1];
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
      setFeedback('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setMessages([]);
    setFeedback('');
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

            {/* Chat */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <InterviewChat messages={messages} loading={loading} />
            </div>

            {/* Feedback */}
            {feedback && <FeedbackPanel feedback={feedback} />}

            {/* Recording — only show when not loading and a question has been asked */}
            {!loading && messages.length > 0 && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-400">
                  Record your answer when you're ready
                </p>
                <AudioRecorder onTranscript={handleAnswer} />
              </div>
            )}

            {loading && (
              <p className="text-center text-sm text-gray-500 animate-pulse">
                Processing your answer...
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// 'use client';
// import { useState } from 'react';
// import AudioRecorder from './components/AudioRecorder';

// type Message = { role: 'user' | 'assistant'; content: string };

// export default function Home() {
//   const [role, setRole] = useState('Software Engineer');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [feedback, setFeedback] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [started, setStarted] = useState(false);

//   const askQuestion = async (history: Message[]) => {
//     setLoading(true);
//     const res = await fetch('/api/interview', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ messages: history, role, mode: 'question' }),
//     });
//     const { reply } = await res.json();
//     const updated = [...history, { role: 'assistant' as const, content: reply }];
//     setMessages(updated);
//     setLoading(false);
//     return updated;
//   };

//   const handleStart = async () => {
//     setStarted(true);
//     await askQuestion([]);
//   };

//   const handleAnswer = async (text: string) => {
//     const withAnswer = [...messages, { role: 'user' as const, content: text }];
//     setMessages(withAnswer);

//     // Get feedback
//     setLoading(true);
//     const fbRes = await fetch('/api/interview', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ messages: withAnswer, role, mode: 'feedback' }),
//     });
//     const { reply: fb } = await fbRes.json();
//     setFeedback(fb);
//     setLoading(false);

//     // Ask next question
//     await askQuestion([...withAnswer, { role: 'assistant', content: fb }]);
//   };

//   return (
//     <main className="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
//       <h1 className="text-4xl font-bold mb-8">🎙 AI Mock Interviewer</h1>

//       {!started ? (
//         <div className="space-y-4">
//           <input value={role} onChange={e => setRole(e.target.value)}
//             className="w-full p-3 bg-gray-800 rounded-lg"
//             placeholder="Job role (e.g. Software Engineer)" />
//           <button onClick={handleStart}
//             className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">
//             Start Interview
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Chat history */}
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {messages.map((m, i) => (
//               <div key={i} className={`p-4 rounded-lg ${m.role === 'assistant'
//                 ? 'bg-blue-900 border border-blue-700' : 'bg-gray-800'}`}>
//                 <span className="text-xs text-gray-400">{m.role === 'assistant' ? '🤖 Interviewer' : '👤 You'}</span>
//                 <p className="mt-1">{m.content}</p>
//               </div>
//             ))}
//             {loading && <p className="text-gray-400 animate-pulse">Thinking...</p>}
//           </div>

//           {/* Feedback */}
//           {feedback && (
//             <div className="p-4 bg-green-900 border border-green-600 rounded-lg">
//               <h3 className="font-bold text-green-400 mb-2">📊 Feedback</h3>
//               <p className="whitespace-pre-wrap text-sm">{feedback}</p>
//             </div>
//           )}

//           {/* Recording */}
//           <AudioRecorder onTranscript={handleAnswer} />
//         </div>
//       )}
//     </main>
//   );
// }

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
