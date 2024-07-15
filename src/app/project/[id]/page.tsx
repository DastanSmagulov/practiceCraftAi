"use client";
import MentorChat from "@/app/components/MentorChat";
import ProjectDescription from "@/app/components/ProjectDescription";
import SubmitProject from "@/app/components/SubmitProject";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

interface Project {
  id: string;
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
}

interface ProjectProps {
  params: {
    id: string;
  };
}

const Project: React.FC<ProjectProps> = ({ params: { id } }) => {
  const [project, setProject] = useState<Project | null>(null); // Initialize project as null
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user.uid, id);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const fetchData = async (userId: string, projectId: string) => {
    try {
      const projectDocRef = doc(db, `projects/users/${userId}/${projectId}`);
      const projectDocSnap = await getDoc(projectDocRef);

      if (projectDocSnap.exists()) {
        const projectData = projectDocSnap.data() as Project;
        setProject(projectData); // Set projectData directly, ensuring it matches Project interface
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-16 pb-10 px-4 md:px-24 min-h-screen">
      <div className="lg:col-span-1">
        <ProjectDescription project={project} />
      </div>
      <div className="lg:col-span-1">
        <MentorChat project={project} />
        <SubmitProject project={project} id={id} />
      </div>
    </div>
  );
};

export default Project;
