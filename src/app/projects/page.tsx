"use client";
import React, { useEffect } from "react";
import ProjectsTable from "../components/ProjectsTable";
import { useRouter } from "next/navigation";

const Projects: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login"); // Redirect to login if user is null
    }
  }, [router]);

  return (
    <div className="pt-20 min-h-screen text-white flex flex-col items-center gap-10 bg-[#1A1A1A]">
      <ProjectsTable />
    </div>
  );
};

export default Projects;
