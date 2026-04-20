import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, role, mode } = await req.json();

    const systemPrompt = mode === 'feedback'
      ? `You are an expert technical interviewer. The user just answered an interview question.
         Give structured feedback with: 1) Score /10, 2) Strengths, 3) Improvements, 4) Model Answer.`
      : `You are conducting a ${role} interview. Ask ONE clear, relevant interview question.
         Vary between behavioral (STAR format) and technical questions. Be concise.`;

    const safeMessages = messages.length > 0
      ? messages
      : [{ role: 'user', content: `Please begin the ${role} interview. Ask me your first question.` }];

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: safeMessages,
    });

    console.log('Claude response:', JSON.stringify(response, null, 2));

    const textBlock = response.content?.find(block => block.type === 'text');

    if (!textBlock || textBlock.type !== 'text') {
      console.error('No text block found:', response.content);
      return NextResponse.json(
        { error: 'No text response from Claude', reply: 'Sorry, something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: textBlock.text });

  } catch (error: any) {
    console.error('Interview API error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Unknown error', reply: 'Sorry, an error occurred. Please try again.' },
      { status: 500 }
    );
  }
}