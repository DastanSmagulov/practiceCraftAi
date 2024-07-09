"use client";
import { useState } from "react";
import axios from "axios";

const CreateProject = () => {
  const [formData, setFormData] = useState({
    knowledgeLevel: "",
    experience: "",
    technologies: "",
    interests: "",
    preferences: "",
  });

  const [generatedProject, setGeneratedProject] = useState(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/createProject", { formData });
      setGeneratedProject(response.data);
    } catch (error) {
      console.error("Error generating project:", error);
    }
  };

  return (
    <div className="max-w-3xl mt-24 mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
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
            className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-bold rounded-md shadow-md hover:bg-orange-600 transition duration-300"
        >
          Generate Project
        </button>
      </form>
      {generatedProject && (
        <div className="mt-6 bg-gray-900 p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-4">Generated Project</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(generatedProject, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CreateProject;
