"use client";
import MentorChat from "@/app/components/MentorChat";
import ProjectDescription from "@/app/components/ProjectDescription";
import SubmitProject from "@/app/components/SubmitProject";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Project = ({ params: { id } }) => {
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/getProjects"
        );
        const projectData = response.data[id - 1];
        setProject(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchData();
  }, [id]); // Ensure useEffect re-runs when id changes

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-10 pb-10 px-4 md:px-24 min-h-screen">
      <div className="lg:col-span-1">
        <ProjectDescription project={project} />
      </div>
      <div className="lg:col-span-1">
        <MentorChat project={project} />
        <SubmitProject project={project} id={id} />
      </div>
    </div>
  );
};

export default Project;
