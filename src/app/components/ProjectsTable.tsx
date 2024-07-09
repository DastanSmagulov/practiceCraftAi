import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";

interface Project {
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
}

const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/getProjects");
      const projectsObject = response.data;

      // Transform object to array
      const projectsArray = Object.values(projectsObject);

      setProjects(projectsArray);
      console.log(projectsArray);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredProjects(projects); // Initialize filtered projects with all projects on initial load
  }, [projects]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (projects) {
      const results = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.stack.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.topics.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(results);
    }
  }, [searchTerm, projects]);

  return (
    <div className="overflow-x-auto w-[80vw] mx-auto mb-20">
      <h1 className="mb-4 text-2xl">Pet projects library</h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <button className="btn">Difficulty</button>
          <button className="btn">Status</button>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search projects"
            className="input input-bordered"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Acceptance</th>
              <th className="py-2 px-4">Difficulty</th>
              <th className="py-2 px-4">Topic</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="py-2 px-4">
                  <span className="text-green-500">✔</span>
                </td>
                <td className="py-2 px-4">
                  <Link href={`/project/${index + 1}`}>{project.name}</Link>
                </td>
                <td className="py-2 px-4">---</td>{" "}
                {/* Placeholder for Acceptance */}
                <td
                  className={`py-2 px-4 ${
                    project.difficulty === "easy"
                      ? "text-green-500"
                      : project.difficulty === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {project.difficulty}
                </td>
                <td className="py-2 px-4">{project.topics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTable;
