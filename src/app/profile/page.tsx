"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Project {
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
  done: boolean;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [solvedCount, setSolvedCount] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchProjects(userData.uid);
    }
  }, []);

  const fetchProjects = async (userId: string) => {
    try {
      const response = await axios.get("/api/getUserProjects", {
        params: { userId },
      });
      const userProjects = response.data;
      setProjects(userProjects);
      calculateSolvedCount(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const calculateSolvedCount = (projects: Project[]) => {
    const solved = projects.filter((project) => project.done);
    const easy = solved.filter(
      (project) => project.difficulty === "easy"
    ).length;
    const medium = solved.filter(
      (project) => project.difficulty === "medium"
    ).length;
    const hard = solved.filter(
      (project) => project.difficulty === "hard"
    ).length;
    setSolvedCount({ easy, medium, hard });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] min-h-[80vh] h-auto flex flex-col items-center justify-center text-white p-4">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md mb-6">
        <div className="flex items-center">
          <img
            src={user.photoURL}
            alt="User Avatar"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
            </div>
            <p className="email-text">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Solved Projects</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="text-green-400">Easy: {solvedCount.easy}</div>
          <div className="text-yellow-400">Medium: {solvedCount.medium}</div>
          <div className="text-red-400">Hard: {solvedCount.hard}</div>
        </div>
        <div className="text-4xl font-bold text-white">
          {solvedCount.easy + solvedCount.medium + solvedCount.hard} /{" "}
          {projects.length}
        </div>
        <p className="text-gray-400 mt-2">Total Solved / Total Projects</p>
      </div>
    </div>
  );
};

export default Profile;
