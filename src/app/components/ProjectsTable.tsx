"use client";
import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { db } from "../firebase/config";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Dropdown from "./Dropdown";

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
  const [originalProjects, setOriginalProjects] = useState<Project[]>([]); // State for original order
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [sortDifficulty, setSortDifficulty] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order state
  const [sortField, setSortField] = useState<string | null>(null); // Sort field state
  const [userLoaded, setUserLoaded] = useState(false); // Flag to track user data loaded
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [formData, setFormData] = useState({
    knowledgeLevel: "",
    experience: "",
    technologies: "",
    interests: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async (userId: string) => {
      try {
        const userProjectsResponse = await axios.get(
          `/api/getUserProjects?userId=${userId}`
        );
        let projectsArray: Project[] = userProjectsResponse.data;

        // Check if user projects exist
        if (projectsArray.length === 0) {
          // Fetch general projects if user projects don't exist
          const generalProjectsResponse = await axios.get(
            "/api/getGeneralProjects"
          );
          projectsArray = generalProjectsResponse.data.map((project: any) => ({
            ...project,
            done: false,
          }));

          // Add general projects to user's projects collection
          for (const project of projectsArray) {
            await addUserProject(userId, project);
          }
        }

        setProjects(projectsArray);
        setOriginalProjects(projectsArray); // Set original order
        setFilteredProjects(projectsArray); // Initially set filtered projects to all projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setUserLoaded(true); // Set user data loaded flag to true
      }
    };

    if (user) {
      fetchProjects(user.uid);
    }
  }, [user]);

  const addUserProject = async (userId: string, project: Project) => {
    const userProjectsRef = collection(db, `projects/users/${userId}`);
    const docRef = doc(userProjectsRef, String(project.id));
    await setDoc(docRef, project);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (projects.length > 0) {
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

      if (sortField) {
        if (sortField === "difficulty") {
          results.sort((a, b) => {
            const order = sortOrder === "asc" ? 1 : -1;
            const difficultyOrder = ["easy", "medium", "hard"];
            return (
              (difficultyOrder.indexOf(a.difficulty) -
                difficultyOrder.indexOf(b.difficulty)) *
              order
            );
          });
        } else {
          results.sort((a, b) => {
            const fieldA = (a as any)[sortField].toLowerCase();
            const fieldB = (b as any)[sortField].toLowerCase();

            if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
            return 0;
          });
        }
      }

      setFilteredProjects(results);
    }
  }, [searchTerm, projects, sortDifficulty, sortStatus, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("asc");
        setSortField(null);
        setFilteredProjects(originalProjects);
      }
    } else {
      setSortOrder("asc");
      setSortField(field);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) {
      console.error("User data not found in localStorage");
      return;
    }

    setLoading(true);
    const { uid } = user;

    try {
      const response = await axios.post(`/api/createProject?userId=${uid}`, {
        formData,
      });
      const { newProjectId } = response.data;
      if (newProjectId) {
        router.push(`/project/${newProjectId}`);
      }
    } catch (error) {
      console.error("Error generating project:", error);
    } finally {
      setLoading(false);
      setShowModal(false); // Close the modal after submission
    }
  };

  if (!userLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <span className="loading loading-spinner loading-lg"></span>
        <h1 className="ml-2">Projects are generated</h1>
      </div>
    );
  }

  const handleRowClick = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };

  const capitalizeFirstLetter = (text: String) => {
    if (!text) return text; // Check if the input is empty or undefined
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="overflow-x-auto w-[80vw] min-h-[90vh] h-auto mx-auto mb-20">
      <h1 className="mb-4 text-3xl font-bold">Pet projects library</h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <Dropdown
            buttonLabel="Difficulty"
            options={[
              { label: "Easy", value: "easy" },
              { label: "Medium", value: "medium" },
              { label: "Hard", value: "hard" },
              { label: "All", value: "all" },
            ]}
            selectedValue={sortDifficulty}
            onSelect={setSortDifficulty}
          />
          <Dropdown
            buttonLabel="Status"
            options={[
              { label: "Done", value: "done" },
              { label: "To-do", value: "to-do" },
              { label: "All", value: "all" },
            ]}
            selectedValue={sortStatus}
            onSelect={setSortStatus}
          />
        </div>
        <div className="flex max-[770px]:flex-col max-[770px]:gap-3 md:space-x-2 md:items-center">
          <input
            type="text"
            placeholder="  🔍  Search projects"
            className="input input-bordered pl-3"
            value={searchTerm}
            onChange={handleSearch}
          />

          <button
            className="bg-orange-500 md:px-6 text-white p-3 rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-2 px-4">Status</th>
              <th
                className="py-2 px-4 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <button className="border-none">Title</button>
                {sortField === "name" ? (
                  <span className="text-xs">
                    {sortOrder === "asc" ? " ↑" : " ↓"}
                  </span>
                ) : (
                  <span className="text-xs"> ↑↓ </span>
                )}
              </th>
              <th
                className="py-2 px-4 cursor-pointer"
                onClick={() => handleSort("difficulty")}
              >
                <button className="border-none">Difficulty</button>
                {sortField === "difficulty" ? (
                  <span className="text-xs">
                    {sortOrder === "asc" ? " ↑" : " ↓"}
                  </span>
                ) : (
                  <span className="text-xs"> ↑↓ </span>
                )}
              </th>
              <th className="py-2 px-4">Topic</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr
                key={index}
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => handleRowClick(project.id)}
              >
                <td className="py-2 px-4">
                  <button
                    className={`bg-transparent border-none text-left text-${
                      project.done ? "green" : "red"
                    }-500`}
                  >
                    {project.done ? "✔" : "✘"}{" "}
                  </button>
                </td>
                <td className="py-2 px-4">
                  {" "}
                  <button className="bg-transparent border-none text-left">
                    {project.name}
                  </button>
                </td>
                <td
                  className={`py-2 pl-4 pr-16 ${
                    project.difficulty === "easy"
                      ? "text-green-500"
                      : project.difficulty === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {capitalizeFirstLetter(project.difficulty)}
                </td>
                <td className="py-2 px-4">{project.topics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Create New Project
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="knowledgeLevel"
                  className="block text-lg font-medium text-white mb-2"
                >
                  Knowledge Level
                </label>
                <input
                  type="text"
                  id="knowledgeLevel"
                  name="knowledgeLevel"
                  value={formData.knowledgeLevel}
                  onChange={handleChange}
                  placeholder="beginner"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-lg font-medium text-white mb-2"
                >
                  Experience
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="2 years"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="technologies"
                  className="block text-lg font-medium text-white mb-2"
                >
                  Technologies or Topics
                </label>
                <input
                  type="text"
                  id="technologies"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="Flux, Next Js"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="interests"
                  className="block text-lg font-medium text-white mb-2"
                >
                  Interests
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="big tennis"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="preferences"
                  className="block text-lg font-medium text-white mb-2"
                >
                  Preferences
                </label>
                <input
                  type="text"
                  id="preferences"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleChange}
                  placeholder="be creative and make it fun"
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  type="button"
                  className="w-full sm:w-auto py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-500 transition duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto py-2 px-4 bg-orange-500 text-white font-bold rounded-md shadow-md hover:bg-orange-600 transition duration-300"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTable;
