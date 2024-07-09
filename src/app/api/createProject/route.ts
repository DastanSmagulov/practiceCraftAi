import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getDatabase, ref, set, get } from "firebase/database";
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

interface FormData {
  knowledgeLevel: string;
  experience: string;
  technologies: string;
  interests: string;
  preferences: string;
}

export async function POST(request: Request) {
  try {
    const { formData }: { formData: FormData } = await request.json();

    const systemPrompt = `
You are a professional developer that creates descriptive pet project ideas for mentees. Provide creative and detailed responses. The project should be in JSON format as this(generate project with api only if you find it and sure about this free api): {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      response.choices &&
      response.choices.length > 0 &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      const responseContent = response.choices[0].message.content.trim();
      console.log("Response content:", responseContent);

      let project;
      try {
        project = JSON.parse(responseContent);
      } catch (parseError: any) {
        console.error("Failed to parse JSON:", parseError.message);
        console.error("Response content:", responseContent);
        throw new Error("Invalid JSON format in OpenAI response");
      }

      console.log("Project to be added to Realtime Database:", project);

      try {
        const database = getDatabase(firebaseApp);
        const projectRef = ref(database, `projects/${new Date().getTime()}`);
        await set(projectRef, project);
        console.log("Project successfully written to Realtime Database");

        // Fetch the updated list of projects
        const snapshot = await get(ref(database, "projects"));
        const projects = snapshot.val();

        return NextResponse.json({ projects, newProjectId: projectRef.key });
      } catch (databaseError: any) {
        console.error(
          "Failed to add document to Realtime Database:",
          databaseError.message
        );
        return NextResponse.json(
          { error: "Failed to add document to Realtime Database" },
          { status: 500 }
        );
      }
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
