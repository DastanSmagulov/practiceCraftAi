import Link from "next/link";

const ProjectsTable = () => {
  return (
    <div className="overflow-x-auto w-[80vw] ml-20">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>difficulty</th>
            <th>stack</th>
            <th>topic</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          <tr>
            <th>1</th>
            <Link href={`/project/${2}`}>
              <th>Spotify clone</th>
            </Link>{" "}
            <td>medium</td>
            <td>mern</td>
            <td>music</td>
          </tr>

          <tr>
            <th>2</th>
            <Link href={`/project/${2}`}>
              <th>Spotify clone</th>
            </Link>
            <td>medium</td>
            <td>mern</td>
            <td>music</td>
          </tr>

          {/* row 3 */}
          <tr>
            <th>3</th>
            <Link href={`/project/${2}`}>
              <th>Spotify clone</th>
            </Link>{" "}
            <td>medium</td>
            <td>mern</td>
            <td>music</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
