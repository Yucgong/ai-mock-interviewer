# 🎙 AI Mock Interviewer

An AI-powered mock interview app that asks you real interview questions, transcribes your spoken answers, and gives you structured feedback with scores — built to help you practice and improve before the real thing.

🔗 **Live Demo**: [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

---

## ✨ Features

- 🤖 **AI-generated questions** — dynamic behavioral and technical questions tailored to your target role
- 🎙 **Voice answers** — speak your answer and Whisper transcribes it in real time
- 📊 **Structured feedback** — every answer gets a score out of 10, strengths, areas to improve, and a model answer
- 🔄 **Multi-turn interview flow** — the interviewer adapts and continues asking questions throughout the session
- 🧑‍💼 **Role-based interviews** — customize for any job title (Software Engineer, Product Manager, Data Scientist, etc.)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| AI Interviewer | Anthropic Claude API |
| Speech-to-Text | OpenAI Whisper API |
| Deployment | Vercel |

---

## 🚀 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/yucgong/ai-mock-interviewer.git
cd ai-mock-interviewer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

- Get your Anthropic key at [console.anthropic.com](https://console.anthropic.com)
- Get your OpenAI key at [platform.openai.com](https://platform.openai.com)

### 4. Start the dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure
app/
├── api/
│   ├── interview/route.ts    # Claude API — question generation & feedback
│   └── transcribe/route.ts   # OpenAI Whisper — audio transcription
├── components/
│   ├── AudioRecorder.tsx     # Mic recording via MediaRecorder API
│   ├── InterviewChat.tsx     # Chat message UI
│   └── FeedbackPanel.tsx     # Score + feedback display
└── page.tsx                  # Main interview page

---

## 🔮 Planned Features

- [ ] Save and review past interview sessions
- [ ] Difficulty levels (Junior / Mid / Senior)
- [ ] Support for more interview types (case studies, coding challenges)
- [ ] User authentication and history dashboard

---

## 👤 Author

**Yu Cheng Gong**  
[GitHub](https://github.com/yucgong) · [LinkedIn](https://linkedin.com/in/your-profile)

---

## 📄 License

MIT