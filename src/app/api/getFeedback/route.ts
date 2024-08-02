import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Replace with your actual API key
});

export async function POST(request: any) {
  try {
    const body = await request.json();
    const { message, project, feedback } = body;

    // Construct the system prompt with the provided data
    const systemPrompt = `
      You are a professional HR advisor creating a descriptive text for a project to show it in CV or resume. Provide structured answer for showcasing my achievements of the project according to this data:

      UserMessages (These are the messages that the user wrote to the mentor, so you can generate difficulties based on these messages): 
      ${JSON.stringify(message, null, 2)}

      Project (Provide text according to project data): 
      ${JSON.stringify(project, null, 2)}

      Feedback (Provide text according to this feedback): 
      ${JSON.stringify(feedback, null, 2)}

      THIS IS IMPORTANT, YOU SHOULD SEND RESPONSE IN THIS FORMAT BY DATA THAT WAS PROVIDED TO YOU IN THE FIRST LINES. Don't add unnesseasy information. Below is just an example:

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
      - Difficulties Faced: example of difficulties that were created by userMessages
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ensure this is the correct model name
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
