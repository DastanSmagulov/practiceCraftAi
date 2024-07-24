import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "../../firebase/config";
import { addDoc, collection } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface FormData {
  knowledgeLevel: string;
  experience: string;
  technologies: string;
  interests: string;
  preferences: string;
}

export async function POST(request: any) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    const { formData }: { formData: FormData } = await request.json();

    const systemPrompt = `
You are a professional developer that creates descriptive pet project ideas for mentees. Provide creative and detailed responses. The project should be in JSON format as this (generate project with API only if you find it and are sure about this free API. If you're not sure about the API, create a project without API): {
      "approved": false,
      "backend api": "https://jsonplaceholder.typicode.com/posts",
      "difficulty": "easy, medium or hard",
      "name": "Blog Application Using Fake Data from JSON",
      "requirements": {
        "bronze": "Create a responsive layout with a header, footer, and main section. Implement basic routing for home, about, and blog pages.",
        "gold": "Add meta headers for SEO purposes. Ensure that each blog post has a unique meta title and description.",
        "silver": "Implement dynamic routing to handle individual blog posts. Ensure that each post is accessible through a unique URL."
      },
      "stack": "React, React Router, CSS",
      "tasks": [
        "Set up project structure",
        "Create responsive header and footer",
        "Implement home page with blog post listings",
        "Add routing for about and blog pages",
        "Integrate dynamic routing for individual blog posts",
        "Add meta headers for SEO"
      ],
      "technical assignment": "Build a blog application that displays posts from a JSON file. Include dynamic routing and SEO meta headers.",
      "topics": "Routing, SEO, API Integration"
    }; and create it according to user response.

User Response:
- Knowledge Level: ${formData.knowledgeLevel}
- Experience: ${formData.experience}
- Technologies or Topics: ${formData.technologies}
- Interests: ${formData.interests}
- Preferences: ${formData.preferences}

Generate a project:
    `;

    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "",
        },
      ],
    });

    if (
      openAIResponse.choices &&
      openAIResponse.choices.length > 0 &&
      openAIResponse.choices[0].message &&
      openAIResponse.choices[0].message.content
    ) {
      const responseContent = openAIResponse.choices[0].message.content.trim();

      let project;
      try {
        project = JSON.parse(responseContent);
      } catch (parseError: any) {
        console.error("Failed to parse JSON:", parseError.message);
        console.error("Response content:", responseContent);
        throw new Error("Invalid JSON format in OpenAI response");
      }

      const docRef = await addDoc(collection(db, `projects/users/${userId}`), {
        ...project,
        done: false,
      });

      return NextResponse.json({ newProjectId: docRef.id }, { status: 200 });
    } else {
      throw new Error("Invalid response from OpenAI");
    }
  } catch (error: any) {
    console.error("OpenAI request failed:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch response from OpenAI" },
      { status: 500 }
    );
  }
}
