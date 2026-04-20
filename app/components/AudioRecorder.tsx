'use client';
import { useState, useRef } from 'react';

export default function AudioRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRef.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const { text } = await res.json();
      onTranscript(text);
    };
    mediaRef.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <button onClick={recording ? stop : start}
      className={`px-6 py-3 rounded-full font-bold text-white transition-all
        ${recording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}>
      {recording ? '⏹ Stop Recording' : '🎙 Record Answer'}
    </button>
  );
}