"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import React, { useState, useEffect } from "react";

interface ProjectDescriptionProps {
  project: {
    name: string;
    difficulty: string;
    topics: string;
    "technical assignment": string;
    "backend api": string;
    requirements: {
      bronze: string;
      silver: string;
      gold: string;
    };
    stack: string;
    tasks: string[];
  } | null; // Ensure project can be null
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ project }) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    () => {
      const saved = localStorage.getItem("checkedItems");
      return saved ? JSON.parse(saved) : {};
    }
  );

  useEffect(() => {
    localStorage.setItem("checkedItems", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCheck = (item: string) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-[90vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container w-full md:w-[80%] py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.name}</h1>
      <div className="flex flex-wrap items-center mb-6">
        <span
          className={`py-1 px-3 rounded-full text-sm font-semibold mr-2 mb-2 ${
            project.difficulty === "easy"
              ? "bg-green-500"
              : project.difficulty === "medium"
              ? "bg-yellow-500"
              : "bg-red-500"
          } text-white flex items-center`}
        >
          {project.difficulty
            ? project.difficulty.charAt(0).toUpperCase() +
              project.difficulty.slice(1)
            : ""}
        </span>{" "}
        <div className="flex flex-wrap">
          <span className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full text-sm font-semibold mr-2 mb-2 overflow-ellipsis wrap">
            {project.topics}
          </span>
        </div>
      </div>
      <p className="mb-4">
        <strong>Technical Assignment:</strong> {project["technical assignment"]}
      </p>
      <p className="mb-4">
        <strong>Backend API:</strong>{" "}
        <a
          href={project["backend api"]}
          className="text-blue-500"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            width: "80vw",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {project["backend api"]}
        </a>
      </p>
      <p className="mb-4">
        <strong>Design Inspiration:</strong>{" "}
        <a
          href="https://dribbble.com/following"
          className="text-blue-500 mr-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dribble
        </a>{" "}
        <a
          href="https://www.behance.net"
          className="text-blue-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          Behance
        </a>
      </p>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Project Requirements:</h2>
        <ul className="list-disc list-inside space-y-1">
          <h1 className="text-[#cd7f32]">Bronze:</h1>
          <li
            className="flex items-center cursor-pointer"
            onClick={() => handleCheck("bronze")}
          >
            <FontAwesomeIcon
              icon={checkedItems["bronze"] ? faCheckCircle : faCircle}
              className="text-gray-400 mr-2"
            />
            <span>{project.requirements.bronze}</span>
          </li>
          <h1 className="text-[#c0c0c0]">Silver:</h1>
          <li
            className="flex items-center cursor-pointer"
            onClick={() => handleCheck("silver")}
          >
            <FontAwesomeIcon
              icon={checkedItems["silver"] ? faCheckCircle : faCircle}
              className="text-gray-400 mr-2"
            />
            <span>{project.requirements.silver}</span>
          </li>
          <h1 className="text-[#FFDF00]">Gold:</h1>
          <li
            className="flex items-center cursor-pointer"
            onClick={() => handleCheck("gold")}
          >
            <FontAwesomeIcon
              icon={checkedItems["gold"] ? faCheckCircle : faCircle}
              className="text-gray-400 mr-2"
            />
            <span>{project.requirements.gold}</span>
          </li>
        </ul>
      </div>
      <h2 className="text-xl font-semibold mb-2">Stack:</h2>
      <p className="mb-4">{project.stack}</p>
      <h2 className="text-xl font-semibold mb-2">Tasks:</h2>
      <ul className="list-disc list-inside space-y-1">
        {project.tasks.map((task: any, index: number) => (
          <li
            key={index}
            className="flex items-center cursor-pointer"
            onClick={() => handleCheck(`task-${index}`)}
          >
            <FontAwesomeIcon
              icon={checkedItems[`task-${index}`] ? faCheckCircle : faCircle}
              className="text-gray-400 mr-2"
            />
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDescription;
