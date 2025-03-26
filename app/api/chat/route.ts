import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for an event planning system. Help users with venue selection, budget tracking, scheduling reminders, and vendor recommendations.",
        },
        ...messages,
      ],
    })

    return NextResponse.json({
      role: "assistant",
      content: response.choices[0].message.content,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "An error occurred during your request." }, { status: 500 })
  }
}

