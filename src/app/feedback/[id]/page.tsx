"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const greptileApiKey = process.env.NEXT_PUBLIC_GREPTILE_API;

const FeedBack: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>("");
  const [githubLink, setGithubLink] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [indexingLoading, setIndexingLoading] = useState<boolean>(true);
  const [feedbackReceived, setFeedbackReceived] = useState<boolean>(false);

  useEffect(() => {
    const storedGithubToken = localStorage.getItem("githubToken");
    if (storedGithubToken) {
      setGithubToken(storedGithubToken);
    }
    const storedProject = localStorage.getItem("project");
    const storedGithubLink = localStorage.getItem("githubLink");

    if (storedProject) {
      setProject(JSON.parse(storedProject));
    }

    if (storedGithubLink) {
      setGithubLink(storedGithubLink);
    }
  }, []);

  const extractRepoDetails = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return null;
  };

  const repository = extractRepoDetails(githubLink);

  const repositoryPayload = {
    remote: "github",
    repository,
  };

  const indexing = () => {
    setIndexingLoading(true);
    fetch("https://api.greptile.com/v2/repositories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${greptileApiKey}`,
        "X-Github-Token": githubToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repositoryPayload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIndexingLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error during indexing: " + error.message);
        setIndexingLoading(false);
      });
  };

  useEffect(() => {
    if (githubToken && repository) {
      indexing();
    }
  }, [githubToken, repository]);

  const queryPayload = {
    messages: [
      {
        id: "some-id-1",
        content: `
        The following is the project description with criteria for different levels. 
        Provide feedback according to this JSON: ${JSON.stringify(project)}.
        If the GitHub link does not fit the criteria, or not about this topic give 0 in the JSON format. Project should meet all criteria including technical assignment. 
        Give detailed feedback for every step of the project, highlighting what the user can do better and what they have done well. 
        Also, assign grades according to the following scheme:
        - Bronze level: out of 100 percent
        - Silver level: out of 100 percent
        - Gold level: out of 100 percent

        Provide the grades in the following JSON format:
        {
          "feedback": [
            {
              "feedback_by_criteria": "Descriptive feedback about the project, code, and technologies.",
              "grade": {
                "bronze": {
                  "grade": "Grade for bronze level",
                  "explanation": "explain what is good and what can be improved."
                },
                "silver": {
                  "grade": "Grade for silver level",
                   "explanation": "explain what is good and what can be improved."
                },
                "gold": {
                  "grade": "Grade for gold level",
                  "explanation": "explain what is good and what can be improved."
                },
                "overall": {
                  "grade": "Overall grade, explain the overall impression and areas of improvement."
                  "explanation": "explain what is good and what can be improved."
                }
              },
              "recommendations": "Recommendations for the project, including resources to read or watch. Provide useful links and positive remarks about the project."
            }
          ]
        }
      `,
        role: "user",
      },
    ],
    repositories: [
      {
        remote: "github",
        repository,
        branch: "main",
      },
    ],
    sessionId: "test-session-id",
  };

  const submit = () => {
    if (indexingLoading) {
      toast.error("Indexing is not finished yet. Please wait.");
      return;
    }

    setLoading(true);
    fetch("https://api.greptile.com/v2/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${greptileApiKey}`,
        "X-Github-Token": githubToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const feedbackString = data.message.match(
          /```json\n([\s\S]*?)\n```/
        )[1];
        const feedbackJson = JSON.parse(feedbackString);

        setFeedback(feedbackJson.feedback);
        setFeedbackReceived(true);
      })
      .catch((error) => {
        console.error("Error submitting query:", error);
        toast.error("Error submitting query: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="overflow-x-auto w-[80vw] mx-auto my-20">
      <ToastContainer />
      <h1 className="mb-4 text-2xl font-bold text-white">Project Feedback</h1>
      {indexingLoading ? (
        <p>Indexing is in progress...</p>
      ) : feedback?.length > 0 ? (
        feedback?.map((item: any, index: number) => (
          <div
            key={index}
            className="mb-6 p-6 border rounded-lg shadow-md bg-white"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Feedback by Criteria
            </h2>
            <p className="mb-4 text-gray-700">{item.feedback_by_criteria}</p>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Grade</h2>
            <div className="mb-4">
              <ul className="list-disc pl-5 text-gray-700">
                <li>Bronze: {item.grade.bronze.grade} / 100</li>
                <li>{item.grade.bronze.explanation}</li>
                <li>Silver: {item.grade.silver.grade} / 100</li>
                <li>{item.grade.silver.explanation}</li>
                <li>Gold: {item.grade.gold.grade} / 100</li>
                <li>{item.grade.gold.explanation}</li>
                <li className="mt-4 font-bold">
                  Overall Grade: {item.grade.overall.grade} / 100
                </li>
                <li className="mt-1 text-sm text-gray-600">
                  {item.grade.overall.explanation}
                </li>
              </ul>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Recommendations
            </h2>
            <div className="text-gray-700">
              {item.recommendations
                .split("\n")
                .map((line: string, idx: number) => (
                  <p key={idx} className="mb-2">
                    {line}
                  </p>
                ))}
            </div>
          </div>
        ))
      ) : indexingLoading ? (
        <p>No feedback available. Indexing is in progress...</p>
      ) : (
        <p>Indexing complete. You can now receive feedback for your project.</p>
      )}
      <div className="mt-4 flex justify-end space-x-4">
        {!feedbackReceived && (
          <button
            onClick={submit}
            className="bg-orange-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-semibold"
          >
            {loading ? "Loading..." : "Receive Feedback"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedBack;
