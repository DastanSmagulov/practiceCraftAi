import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: any) {
  try {
    const { message, project } = await request.json();

    const systemPrompt = `
You are a professional senior frontend mentor. Provide creative and detailed responses without giving direct answers. Only give solutions after five messages on the same topic.

Project Details:
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
      model: "gpt-3.5-turbo",
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
