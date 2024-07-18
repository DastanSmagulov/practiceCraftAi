"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OpenAI } from "openai";
import { db, firebase_app as firebaseApp } from "../firebase/config";
import { addDoc, collection } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

const CreateProject = () => {
  const [formData, setFormData] = useState({
    knowledgeLevel: "",
    experience: "",
    technologies: "",
    interests: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) {
      console.error("User data not found in localStorage");
      return;
    }

    setLoading(true);
    const { uid } = user;

    const systemPrompt = `
You are a professional developer that creates descriptive pet project ideas for mentees. Provide creative and detailed responses. The project should be in JSON format as this(generate project with api only if you find it and sure about this free api. if you don't sure about api create project without api): {
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

    try {
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

        console.log("Project to be added to Firestore:", project);

        try {
          const docRef = await addDoc(collection(db, `projects/users/${uid}`), {
            ...project,
            done: false,
          });

          console.log(
            "Project successfully written to Firestore with ID:",
            docRef.id
          );

          router.push(`/project/${docRef.id}`);
        } catch (databaseError: any) {
          console.error(
            "Failed to add document to Firestore:",
            databaseError.message
          );
          throw new Error("Failed to add document to Firestore");
        }
      } else {
        throw new Error("Invalid response from OpenAI");
      }
    } catch (error) {
      console.error("Error generating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl my-24 mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium mb-2">
            Knowledge Level
          </label>
          <input
            type="text"
            name="knowledgeLevel"
            value={formData.knowledgeLevel}
            placeholder="beginner"
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="2 years"
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">
            Technologies or Topics
          </label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            placeholder="Flux, Next Js"
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Interests</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="big tennis"
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Preferences</label>
          <input
            type="text"
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            placeholder="be creative and make it fun"
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-bold rounded-md shadow-md hover:bg-orange-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Generating Project..." : "Generate Project"}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
