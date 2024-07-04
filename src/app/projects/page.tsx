"use client";
import ProjectsTable from "../components/ProjectsTable";

const Projects: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen text-white flex flex-col items-center gap-10 bg-[#1A1A1A]">
      <ProjectsTable />
    </div>
  );
};

export default Projects;
