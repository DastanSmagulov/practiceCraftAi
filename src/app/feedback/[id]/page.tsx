"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { jsPDF } from "jspdf";

const greptileApiKey = process.env.NEXT_PUBLIC_GREPTILE_API;

const FeedBack: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>("");
  const [githubLink, setGithubLink] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [indexingLoading, setIndexingLoading] = useState<boolean>(true);
  const [feedbackReceived, setFeedbackReceived] = useState<boolean>(false);
  const [uid, setUid] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState<boolean>(false); // New state for PDF loading
  const [totalGrade, setTotalGrade] = useState<number>(0); // State for total grade

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        const storedGithubToken = localStorage.getItem("githubToken");
        if (storedGithubToken) {
          setGithubToken(storedGithubToken);
        }

        const storedProject = localStorage.getItem("project");
        const storedGithubLink = localStorage.getItem("githubLink");
        const storedProjectId = localStorage.getItem("projectId");

        if (storedProject) {
          setProject(JSON.parse(storedProject));
        }

        if (storedProjectId) {
          setProjectId(storedProjectId);
        }

        if (storedGithubLink) {
          setGithubLink(storedGithubLink);
        }
      } else {
        router.push("/login"); // Redirect to login if user is null
      }
    });

    return () => unsubscribe();
  }, [router]);

  const extractRepoDetails = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return null;
  };

  const repository = extractRepoDetails(githubLink) || "";

  const repositoryPayload = {
    remote: "github",
    repository,
  };

  const indexing = async () => {
    const githubRepoRegex = /^[\w-]+\/[\w-]+$/;
    const githubPatRegex = /^github_pat_[0-9a-zA-Z_]{22,}$/;

    // Check if repository URL and GitHub token are valid
    if (!repository) {
      toast.error(
        "Invalid GitHub repository URL. Please use the correct format."
      );
      // router.push(`/project/${projectId}`);
      return;
    }

    if (!githubPatRegex.test(githubToken)) {
      toast.error("Invalid GitHub Personal Access Token format.");
      // router.push(`/project/${projectId}`);
      return;
    }

    if (githubPatRegex.test(githubToken) && repository) {
      setIndexingLoading(true);
      try {
        const response = await fetch(
          "https://api.greptile.com/v2/repositories",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${greptileApiKey}`,
              "X-Github-Token": githubToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(repositoryPayload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `API Error: ${response.status} - ${
              errorData.message || response.statusText
            }`
          );
        }

        setIndexingLoading(false);
        toast.success("Indexing completed successfully.");
      } catch (error: any) {
        console.error("Error:", error);
        toast.error("Error during indexing: " + error.message);
        setIndexingLoading(false);
      }
    }
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
        If the GitHub link does not fit the criteria of the project, or github link not about this topic give 0 in the JSON format. Project should meet all criteria including technical assignment. 
        Give detailed feedback for every step of the project, highlighting what the user can do better and what they have done well. 
        Also, assign grades according to the following scheme:
        - Bronze level: out of 100 percent
        - Silver level: out of 100 percent
        - Gold level: out of 100 percent

        Provide the grades in the following JSON format:
        {
          "feedback": [
            {
              "general_information": "There should be descriptive feedback about the project, code, and technologies. Not this words, but actual feedback",
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
          return response.json().then((error) => {
            throw new Error(
              `API Error: ${response.status} - ${
                error.message || response.statusText
              }`
            );
          });
        }
        return response.json();
      })
      .then(async (data) => {
        try {
          const feedbackString = data.message.match(
            /```json\n([\s\S]*?)\n```/
          )[1];
          const feedbackJson = JSON.parse(feedbackString);

          setFeedback(feedbackJson.feedback);
          setFeedbackReceived(true);

          const overallGradeString =
            feedbackJson.feedback[0]?.grade?.overall?.grade + "";
          if (overallGradeString) {
            let numericGradeString = overallGradeString.trim();
            if (numericGradeString.endsWith("%")) {
              numericGradeString = numericGradeString.slice(0, -1);
            }
            const numericGrade = parseFloat(numericGradeString);

            if (!isNaN(numericGrade) && numericGrade > 70) {
              const projectRef = doc(db, `projects/users/${uid}/${projectId}`);
              await updateDoc(projectRef, {
                done: true,
              });
              toast.success("Project submitted and marked as done!");
            } else {
              toast.info(
                "Project submitted but not marked as done due to low grade."
              );
            }
            setTotalGrade(numericGrade);
          } else {
            throw new Error("Invalid overall grade format received.");
          }
        } catch (error: any) {
          console.error("Error parsing feedback data:", error);
          toast.error("Error processing feedback data: " + error.message);
        }
      })
      .catch((error: any) => {
        console.error("Error submitting query:", error);
        toast.error("Error submitting query: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const generatePDF = async () => {
    if (!project || !feedback.length) {
      toast.error("No project or feedback data available for PDF generation.");
      return;
    }

    setPdfLoading(true);

    try {
      const userMessages = localStorage.getItem(`userMessages_${projectId}`);
      const response = await fetch("/api/getFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessages || "",
          project: project || {},
          feedback: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const feedbackText = responseData.response;

      const pdfDoc = new jsPDF();
      const title = project.name || "Project Feedback";
      pdfDoc.setFontSize(20);
      pdfDoc.text(title, 20, 10);

      // General Feedback Section
      pdfDoc.setFontSize(16);
      pdfDoc.text("General Feedback:", 20, 20);

      let startY = 30;
      const lineHeight = 7; // Adjust as needed for spacing between lines
      const maxWidth = pdfDoc.internal.pageSize.getWidth() - 40; // Adjust as needed for left and right margins

      feedback.forEach((item: any, index: number) => {
        // Criteria
        pdfDoc.setFont("helvetica", "bold");
        const criteriaText = `${index + 1}. ${item.general_information}`;
        const splitCriteriaText = pdfDoc.splitTextToSize(
          criteriaText,
          maxWidth
        );
        pdfDoc.text(splitCriteriaText, 20, startY);
        startY += splitCriteriaText.length * lineHeight;
        pdfDoc.setFont("helvetica", "normal");

        // Bronze Grade
        pdfDoc.setFontSize(12);
        const bronzeGradeText = `Bronze: ${item.grade.bronze.grade} / 100`;
        pdfDoc.text(bronzeGradeText, 30, startY + lineHeight);

        // Silver Grade
        const silverGradeText = `Silver: ${item.grade.silver.grade} / 100`;
        pdfDoc.text(silverGradeText, 30, startY + 2 * lineHeight);

        // Gold Grade
        const goldGradeText = `Gold: ${item.grade.gold.grade} / 100`;
        pdfDoc.text(goldGradeText, 30, startY + 3 * lineHeight);

        // Overall Grade
        const overallGradeText = `Overall: ${item.grade.overall.grade} / 100`;
        pdfDoc.text(overallGradeText, 30, startY + 4 * lineHeight);

        // Recommendations
        pdfDoc.setFontSize(16);
        const recommendationsText = `Recommendations:\n${item.recommendations}`;
        const splitRecommendations = pdfDoc.splitTextToSize(
          recommendationsText,
          maxWidth
        );
        pdfDoc.text(splitRecommendations, 20, startY + 5 * lineHeight);

        // Adjust startY for the next feedback item
        const maxBlockHeight =
          Math.max(splitRecommendations.length) * lineHeight;

        startY += maxBlockHeight + 10; // Add extra space between feedback items
      });

      // New Page for CV Description
      pdfDoc.addPage();
      pdfDoc.setFontSize(20);
      pdfDoc.text("Project Description for CV:", 20, 10);

      pdfDoc.setFontSize(12);
      pdfDoc.text(feedbackText, 20, 20, { maxWidth: 170 });

      pdfDoc.save("feedback.pdf");
      toast.success("PDF Generated and downloaded.");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF: " + error.message);
    } finally {
      setPdfLoading(false); // Set PDF loading state to false
      localStorage.removeItem(`userMessages_${project.id}`);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#181818] text-white p-8 flex flex-col items-center justify-center">
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
        <div className="rounded-lg shadow-md w-full max-w-3xl">
          {feedback.map((item: any, index: number) => (
            <div
              key={index}
              className="mb-6 p-6 border rounded-lg shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Feedback
              </h2>
              <p className="mb-4 text-gray-700">{item.general_information}</p>
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
                    <p key={idx} className="mb-2 break-words">
                      {line.includes("http")
                        ? line.split(" ").map((word, index) => (
                            <span key={index}>
                              {word.startsWith("http") ? (
                                <a
                                  href={word}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {word}
                                </a>
                              ) : (
                                `${word} `
                              )}
                            </span>
                          ))
                        : line}
                    </p>
                  ))}
              </div>
            </div>
          ))}
          <div className="flex justify-between max-md:flex-col mb-5">
            <button
              onClick={() => router.push("/projects")}
              className="bg-orange-500 text-white p-3 text-sm rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold mt-4"
            >
              Go to Projects
            </button>
            <div
              className="tooltip"
              data-tip={
                totalGrade < 70
                  ? "You should receive more than 70 percent to view feedback in pdf format and recieve project description for CV"
                  : "Here you can generate feedback in pdf format, and project description for CV."
              }
            >
              <button
                onClick={generatePDF}
                disabled={pdfLoading || totalGrade < 70}
                className="bg-orange-500 text-white p-3 text-sm w-full rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold mt-4"
              >
                {pdfLoading ? "PDF is generating..." : "Generate detailed PDF"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Click to get your feedback
          </h2>
          <button
            onClick={submit}
            disabled={loading}
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
