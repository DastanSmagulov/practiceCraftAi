import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/config"; // Adjust the import path as necessary
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const userProjectsRef = collection(db, `projects/users/${userId}`);
    const userProjectsSnapshot = await getDocs(userProjectsRef);

    if (userProjectsSnapshot.empty) {
      return NextResponse.json(
        { error: "No projects available for this user" },
        { status: 404 }
      );
    }

    const userProjects = userProjectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(userProjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
}
