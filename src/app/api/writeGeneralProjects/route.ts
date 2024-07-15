// // writeGeneralProjects.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "../../firebase/config"; // Adjust the import path as necessary
// import { collection, addDoc } from "firebase/firestore";
// import projectsData from "../../../../projects.json"; // Adjust the path to your JSON file

// interface Project {
//   approved: boolean;
//   "backend api": string;
//   difficulty: string;
//   name: string;
//   requirements: {
//     bronze: string;
//     silver: string;
//     gold: string;
//   };
//   stack: string;
//   tasks: string[];
//   "technical assignment": string;
//   topics: string;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const projectsCollectionRef = collection(db, "projects", "general", "data");

//     // Ensure projectsData is correctly typed and casted to Project[]
//     const projects: Project[] = projectsData.projects;

//     // Loop through each project in the JSON file and add it to Firestore
//     for (const project of projects) {
//       await addDoc(projectsCollectionRef, project);
//     }

//     return NextResponse.json(
//       { message: "General projects added successfully" },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     console.error("Error writing general projects:", error);
//     return NextResponse.json(
//       { error: `Failed to write general projects: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }
