"use client";
import { useEffect, useState } from "react";
import ProjectsTable from "../components/ProjectsTable";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

type Item = {
  id: string;
  // Add other fields based on your Firestore document structure
};

const Projects: React.FC = () => {
  // Specify the type for the items state
  const [projects, setProjects] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Item))
      );
    };

    fetchItems();
  }, []);

  return (
    <div className="pt-20 min-h-screen text-white flex flex-col items-center gap-10 bg-[#1A1A1A]">
      <ProjectsTable />
    </div>
  );
};

export default Projects;
