"use client";
import MentorChat from "@/app/components/MentorChat";
import ProjectDescription from "@/app/components/ProjectDescription";
import SubmitProject from "@/app/components/SubmitProject";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Project {
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
}

interface ProjectProps {
  params: {
    id: string;
  };
}

const Project: React.FC<ProjectProps> = ({ params: { id } }) => {
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { uid } = JSON.parse(storedUser);
      console.log(uid, id);
      fetchData(uid, id);
    } else {
      router.push("/login");
    }
  }, [id, router]);

  const fetchData = async (userId: string, projectId: string) => {
    try {
      console.log(userId, projectId);
      const response = await axios.get("/api/getUserProjectsById", {
        params: { userId, projectId },
      });
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
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
