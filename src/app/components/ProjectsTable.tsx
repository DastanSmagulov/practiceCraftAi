import Link from "next/link";
import { promises as fs } from "fs";

const ProjectsTable = async () => {
  let data;
  try {
    const file = await fs.readFile(
      process.cwd() + "/src/app/projects.json",
      "utf8"
    );
    data = JSON.parse(file);
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    data = { projects: [] };
  }

  console.log("Data:", data); // Debugging line

  if (!data.projects || data.projects.length === 0) {
    return <div>No projects found.</div>;
  }

  return (
    <div className="overflow-x-auto w-[80vw] mx-auto mb-20">
      <h1 className="mb-4 text-2xl">Pet projects library</h1>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button className="btn">Lists</button>
          <button className="btn">Difficulty</button>
          <button className="btn">Status</button>
          <button className="btn">Tags</button>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search questions"
            className="input input-bordered"
          />
        </div>
      </div>
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
          {data.projects.map((project: any, index: any) => (
            <tr key={index} className="hover:bg-gray-700">
              <td className="py-2 px-4">
                <span className="text-green-500">✔</span>
              </td>
              <td className="py-2 px-4">
                <Link href={`/project/${index + 1}`}>{project.name}</Link>
              </td>
              <td className="py-2 px-4">---</td>{" "}
              {/* Placeholder for Acceptance */}
              <td className="py-2 px-4 text-yellow-500">
                {project.difficulty}
              </td>
              <td className="py-2 px-4">{project.topics}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
