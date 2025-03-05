import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: "You are an AI assistant for an event planning system. Help users with venue selection, budget tracking, scheduling reminders, and vendor recommendations.",
    apiKey: process.env.OPENAI_API_KEY, // Access the API key from environment variables
  });
  return result.toDataStreamResponse();
}

