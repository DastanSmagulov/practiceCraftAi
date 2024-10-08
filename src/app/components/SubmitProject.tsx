import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";

const SubmitProject: React.FC<{ project: any; id: string }> = ({
  project,
  id,
}) => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [githubLink, setGithubLink] = useState<string>("");
  const [githubToken, setGithubToken] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedGithubToken = localStorage.getItem("githubToken");
    if (storedGithubToken) {
      setGithubToken(storedGithubToken);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubLink(e.target.value);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubToken(e.target.value);
  };

  const isValidGitHubLink = (link: string) => {
    return link.startsWith("https://github.com/");
  };

  const isValidGithubToken = (token: string) => {
    return token.startsWith("github_pat");
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!isValidGitHubLink(githubLink) && !isValidGithubToken(githubToken)) {
      setError("Invalid GitHub link and Github personal access token");
      return;
    }

    if (!isValidGitHubLink(githubLink)) {
      setError("Invalid GitHub link provided.");
      return;
    }

    if (!isValidGithubToken(githubToken)) {
      setError("Invalid GitHub Personal Access Token.");
      return;
    }

    try {
      localStorage.setItem("project", JSON.stringify(project));
      localStorage.setItem("projectId", id);
      localStorage.setItem("githubLink", githubLink);
      localStorage.setItem("githubToken", githubToken);
      router.push(`/feedback/${id}`);
    } catch (error: any) {
      setError(error.message || "An error occurred.");
    }
  };
  return (
    <div className="flex flex-col items-center gap-3 p-8 bg-gray-900 text-white rounded-md shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Submit Your Project for Feedback
      </h2>
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}
      <p className="text-lg mb-3 text-center">
        Please provide your GitHub link and Personal Access Token (PAT) so our
        API can check your work and provide feedback.
      </p>
      <div className="flex flex-col 2xl:flex-row gap-2 w-full items-center">
        <input
          type="text"
          className="flex-1 p-3 bg-gray-700 focus:outline-none rounded-md shadow-md text-gray-200 placeholder-gray-400"
          placeholder="Link to public github repo"
          value={githubLink}
          onChange={handleChange}
        />
        <input
          type="text"
          id="githubToken"
          placeholder="GitHub Personal Access Token"
          className="flex-1 p-3 bg-gray-700 focus:outline-none rounded-md shadow-md text-gray-200 placeholder-gray-400 mt-2 md:mt-0"
          value={githubToken}
          onChange={handleTokenChange}
        />
        <button
          onClick={handleSubmit}
          className="bg-orange-500 text-white p-3 text-sm rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold mt-2 md:mt-0"
        >
          Submit
        </button>
      </div>
      <a
        href="https://github.com/settings/tokens?type=beta"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline text-sm block text-center mt-3"
      >
        Click here to generate a PAT.
      </a>
      <a
        href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline text-sm block text-center"
      >
        Guide from github. Make sure to select the repo scope when creating the
        token
      </a>
    </div>
  );
};

export default SubmitProject;
