import Hero from "../components/Hero";
import ProjectsTable from "../components/ProjectsTable";

const Projects = () => {
  return (
    <div className="pt-20 bg-black h-screen text-white flex flex-col items-center justify-center gap-10">
      <h1>Projects</h1>
      <ProjectsTable />
    </div>
  );
};

export default Projects;
