import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { db } from "../firebase/config";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

interface Project {
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
  backendApi: string;
  id: number;
  requirements: {
    bronze: string;
    silver: string;
    gold: string;
  };
  tasks: string[];
  technicalAssignment: string;
  done: boolean;
}

const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [sortDifficulty, setSortDifficulty] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { uid } = JSON.parse(storedUser);
      fetchData(uid);
      addUserProjects(uid).catch(console.error); // Add user projects if not already added
    }
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const userProjectsResponse = await axios.get(
        `/api/getUserProjects?userId=${userId}`
      );
      let projectsArray: Project[] = userProjectsResponse.data;

      // Check if user projects exist
      if (projectsArray.length === 0) {
        const generalProjectsResponse = await axios.get("/api/getProjects");
        projectsArray = generalProjectsResponse.data.map((project: any) => ({
          ...project,
          done: false,
        }));
      }

      setProjects(projectsArray);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (projects) {
      let results = [...projects];

      if (sortDifficulty) {
        if (sortDifficulty !== "all") {
          results = results.filter(
            (project) => project.difficulty.toLowerCase() === sortDifficulty
          );
        }
      }

      if (sortStatus !== null && sortStatus !== "all") {
        const statusFilter = sortStatus === "done";
        results = results.filter((project) => project.done === statusFilter);
      }

      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        results = results.filter(
          (project) =>
            project.name.toLowerCase().includes(searchTermLower) ||
            project.stack.toLowerCase().includes(searchTermLower) ||
            project.topics.toLowerCase().includes(searchTermLower)
        );
      }

      setFilteredProjects(results);
    }
  }, [searchTerm, projects, sortDifficulty, sortStatus]);

  async function addUserProjects(userId: string) {
    const userProjectsRef = collection(db, `projects/users/${userId}`);
    const userProjectsSnapshot = await getDocs(userProjectsRef);

    // Check if the project already exists in the user's projects
    const existingProjects = userProjectsSnapshot.docs.map(
      (doc) => doc.data() as Project
    );

    for (const project of existingProjects) {
      // Set done to false by default if not already present
      const doneValue = project.done ?? false;
      const userProject = { ...project, done: doneValue };

      const docRef = doc(userProjectsRef, String(userProject.id));
      await setDoc(docRef, userProject);
    }
  }

  const handleSortDifficulty = (difficulty: string) => {
    setSortDifficulty(difficulty);
  };

  const handleSortStatus = (status: string) => {
    setSortStatus(status);
  };

  return (
    <div className="overflow-x-auto w-[80vw] h-screen mx-auto mb-20">
      <h1 className="mb-4 text-2xl">Pet projects library</h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <div className="dropdown">
            <button className="btn m-1">Difficulty</button>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <button
                  className={`menu-item ${
                    sortDifficulty === "easy" ? "active" : ""
                  }`}
                  onClick={() => handleSortDifficulty("easy")}
                >
                  Easy
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${
                    sortDifficulty === "medium" ? "active" : ""
                  }`}
                  onClick={() => handleSortDifficulty("medium")}
                >
                  Medium
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${
                    sortDifficulty === "hard" ? "active" : ""
                  }`}
                  onClick={() => handleSortDifficulty("hard")}
                >
                  Hard
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${
                    sortDifficulty === "all" ? "active" : ""
                  }`}
                  onClick={() => handleSortDifficulty("all")}
                >
                  All
                </button>
              </li>
            </ul>
          </div>
          <div className="dropdown">
            <button className="btn m-1">Status</button>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li>
                <button
                  className={`menu-item ${
                    sortStatus === "done" ? "active" : ""
                  }`}
                  onClick={() => handleSortStatus("done")}
                >
                  Done
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${
                    sortStatus === "to-do" ? "active" : ""
                  }`}
                  onClick={() => handleSortStatus("to-do")}
                >
                  To-do
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${
                    sortStatus === "all" ? "active" : ""
                  }`}
                  onClick={() => handleSortStatus("all")}
                >
                  All
                </button>
              </li>
            </ul>
          </div>
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
                  <span
                    className={`text-${project.done ? "green" : "red"}-500`}
                  >
                    {project.done ? "✔" : "✘"}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <Link href={`/project/${project.id}`}>{project.name}</Link>
                </td>
                <td className="py-2 px-4">---</td>
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
