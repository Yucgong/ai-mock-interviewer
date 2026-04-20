import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });

  } catch (error: any) {
    console.error('Transcribe error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Transcription failed', text: '' },
      { status: 500 }
    );
  }
}