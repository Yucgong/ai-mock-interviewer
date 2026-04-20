'use client';
import { useState, useRef } from 'react';

export default function AudioRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRef.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRef.current.onstop = async () => {
      setTranscribing(true);
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const { text } = await res.json();
      setTranscribing(false);
      onTranscript(text);
    };
    mediaRef.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRef.current?.stop();
    mediaRef.current?.stream.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={recording ? stop : start}
        disabled={transcribing}
        className={`px-8 py-3 rounded-full font-bold text-white transition-all
          ${transcribing ? 'bg-gray-600 cursor-not-allowed'
          : recording ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {transcribing ? '⏳ Transcribing...'
          : recording ? '⏹ Stop Recording'
          : '🎙 Record Answer'}
      </button>
      {transcribing && (
        <p className="text-xs text-gray-500 animate-pulse">Converting speech to text...</p>
      )}
    </div>
  );
}