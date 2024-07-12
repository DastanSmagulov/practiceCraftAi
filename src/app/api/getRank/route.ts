import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/config";
import { collection, getDocs, DocumentData } from "firebase/firestore";

// Define types for user and project data
interface Project {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  done: boolean;
  approved: boolean;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  totalPoints?: number;
}

export async function GET(request: NextRequest) {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const users: User[] = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    const difficultyPoints: Record<"easy" | "medium" | "hard", number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    const rankedUsers: User[] = await Promise.all(
      users.map(async (user) => {
        let totalPoints = 0;
        const projectsRef = collection(db, `users/${user.id}/projects`);
        const projectsSnapshot = await getDocs(projectsRef);

        projectsSnapshot.docs.forEach((projectDoc) => {
          const project = projectDoc.data() as Project;
          if (project.done && project.approved) {
            totalPoints += difficultyPoints[project.difficulty];
          }
        });

        return {
          ...user,
          totalPoints,
        };
      })
    );

    rankedUsers.sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

    return NextResponse.json(rankedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
