"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const greptileApiKey = process.env.NEXT_PUBLIC_GREPTILE_API;

const FeedBack: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>("");
  const [githubLink, setGithubLink] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [indexingLoading, setIndexingLoading] = useState<boolean>(true);
  const [feedbackReceived, setFeedbackReceived] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const storedGithubToken = localStorage.getItem("githubToken");
    const storedUser = localStorage.getItem("user");
    const storedUserId = localStorage.getItem("userId");
    if (storedGithubToken) {
      setGithubToken(storedGithubToken);
    }
    if (!storedUser) {
      router.push("/login"); // Redirect to login if user is null
      return;
    }

    const storedProject = localStorage.getItem("project");
    const storedGithubLink = localStorage.getItem("githubLink");

    if (storedProject) {
      setProject(JSON.parse(storedProject));
    }

    if (storedGithubLink) {
      setGithubLink(storedGithubLink);
    }
  }, [router]);

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
      .then(async (data) => {
        const feedbackString = data.message.match(
          /```json\n([\s\S]*?)\n```/
        )[1];
        const feedbackJson = JSON.parse(feedbackString);

        setFeedback(feedbackJson.feedback);
        setFeedbackReceived(true);

        // Check if the overall grade is above 70%
        const overallGradeString =
          feedbackJson.feedback[0]?.grade?.overall?.grade;
        console.log(overallGradeString);
        if (overallGradeString) {
          // Extract numeric grade
          let numericGradeString = overallGradeString.trim();
          if (numericGradeString.endsWith("%")) {
            numericGradeString = numericGradeString.slice(0, -1); // Remove '%' if present
          }
          const numericGrade = parseFloat(numericGradeString);

          if (!isNaN(numericGrade) && numericGrade > 70) {
            const projectRef = doc(
              db,
              "projects",
              "users",
              "3Se9Nnj0zodGiXwFaoZS2IqniIm2",
              "1"
            );
            await updateDoc(projectRef, {
              done: true,
            });
            console.log("after", projectRef);
            toast.success("Project submitted and marked as done!");
          } else {
            toast.info(
              "Project submitted but not marked as done due to low grade."
            );
          }
        } else {
          throw new Error("Invalid overall grade format received.");
        }
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
    <div className="min-h-[91vh] bg-[#181818] text-white p-8 flex flex-col items-center justify-center">
      <header className="w-full max-w-3xl bg-gray-800 p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-center">Project Feedback</h1>
      </header>
      <ToastContainer />
      {indexingLoading ? (
        <div className="text-center">
          <div className="text-lg font-bold mb-4">Indexing in Progress...</div>
          <div className="loader mb-4"></div>
          <p className="text-sm text-gray-400">
            Please wait while we index your repository. This may take a few
            moments.
          </p>
        </div>
      ) : loading ? (
        <div className="text-lg font-bold mb-2">Generating feedback...</div>
      ) : feedbackReceived ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-3xl">
          {feedback.map((item: any, index: number) => (
            <div
              key={index}
              className="mb-6 p-6 border rounded-lg shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Feedback by Criteria
              </h2>
              <p className="mb-4 text-gray-700">{item.feedback_by_criteria}</p>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Grade
              </h2>
              <div className="mb-4">
                <ul className="list-disc pl-5 text-gray-700">
                  <li>
                    <span className="font-bold">Bronze:</span>{" "}
                    {item.grade.bronze.grade} / 100
                    <p className="text-gray-600">
                      {item.grade.bronze.explanation}
                    </p>
                  </li>
                  <li>
                    <span className="font-bold">Silver:</span>{" "}
                    {item.grade.silver.grade} / 100
                    <p className="text-gray-600">
                      {item.grade.silver.explanation}
                    </p>
                  </li>
                  <li>
                    <span className="font-bold">Gold:</span>{" "}
                    {item.grade.gold.grade} / 100
                    <p className="text-gray-600">
                      {item.grade.gold.explanation}
                    </p>
                  </li>
                  <li className="mt-4 font-bold">
                    Overall Grade: {item.grade.overall.grade} / 100
                    <p className="text-gray-600">
                      {item.grade.overall.explanation}
                    </p>
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
          ))}
          <button
            onClick={() => router.push("/projects")}
            className="bg-orange-500 text-white p-3 text-sm rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold mt-4"
          >
            Go to Projects
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Click to get your feedback
          </h2>
          <button
            onClick={submit}
            className="bg-orange-500 text-white p-3 text-sm rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold mt-2"
          >
            Get Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedBack;
