"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateProject = () => {
  const [formData, setFormData] = useState({
    knowledgeLevel: "",
    experience: "",
    technologies: "",
    interests: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // Assuming user data includes `uid`
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
    try {
      if (!user) {
        console.error("User data not found in localStorage");
        return;
      }

      setLoading(true);

      const { uid } = user;

      const response = await axios.post(`/api/createProject?userId=${uid}`, {
        formData,
      });

      const { newProjectId } = response.data;
      if (newProjectId) {
        router.push(`/project/${newProjectId}`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating project:", error);
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
