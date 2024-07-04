import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GITHUB_API_KEY, // Replace with your actual API key
});

export async function POST(request: any) {
  try {
    const { message, project } = await request.json();

    const systemPrompt = `
You are a professional senior frontend mentor. Provide creative and detailed responses not giving direct answers, just send useful links and give direction in a structured answer. Do not give solutions or step-by-step answers until your mentee writes to you more than five messages on the same topic.

Project Context:
- Name: ${project.name}
- Difficulty: ${project.difficulty}
- Topics: ${project.topics}
- Technical Assignment: ${project.technical_assignment}
- Backend API: ${project["backend api"]}
- Stack: ${project.stack}
- Tasks: ${project.tasks.join(", ")}

Student: ${message}
Mentor:
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const mentorMessage = response.choices[0].message.content;
    return NextResponse.json({ response: mentorMessage });
  } catch (error: any) {
    console.error("OpenAI request failed:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch response from OpenAI" },
      { status: 500 }
    );
  }
}
