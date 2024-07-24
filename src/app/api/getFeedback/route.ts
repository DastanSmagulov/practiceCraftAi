import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Replace with your actual API key
});

export async function POST(request: any) {
  try {
    const body = await request.json();
    const { message, project, feedback } = body;

    console.log(project, feedback, message);

    const systemPrompt = `
    You are a professional HR advisor creating a descriptive text for a project to show it in CV or resume. Provide structured answer for showcasing my achievements of the project.

    Provide text according to this JSONs:
    UserMessages: ${message}
This is the messages that user wrote to mentor, so you can generate difiiculties by this messages
Project: ${project}
Feedback: ${feedback}

THIS IS IMPORTANT, YOU SHOULD SEND RESPONSE IN THIS FORMSAT BY DATA THAT WAS PROVIDED to you in the first lines. Below just an example:
- Name of the project: ${project.name}
- Technical Assignment: ${project["technical assignment"]}
- Description:
  Developed a comprehensive fitness tracker application, enabling users to log activities and monitor progress through detailed data visualizations.
  Structured the project with a responsive layout, incorporating a polished header and footer to enhance user experience.
  Implemented a dynamic home page listing various fitness activities, ensuring seamless navigation through React Router.
  Added a dedicated page for logging new activities, complete with robust form validation to ensure accurate data entry.
  Integrated Google Charts to display user activity data, providing insightful visual representations of fitness progress.
  Implemented secure user authentication with Firebase, allowing users to save and retrieve their activity data reliably.
  Created a comprehensive dashboard displaying overall fitness progress, facilitating easy tracking of user goals and achievements.
- Difficulties Faced: example of difficulties
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
  } catch (error) {
    console.error("OpenAI request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch response from OpenAI" },
      { status: 500 }
    );
  }
}
