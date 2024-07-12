import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/config"; // Adjust the import path as necessary
import { collection, doc, getDoc } from "firebase/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const projectDocRef = doc(db, `projects/users/${userId}/${projectId}`);
    const projectDocSnap = await getDoc(projectDocRef);

    if (!projectDocSnap.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = { id: projectDocSnap.id, ...projectDocSnap.data() };

    return NextResponse.json(projectData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user project:", error);
    return NextResponse.json(
      { error: "Failed to fetch user project" },
      { status: 500 }
    );
  }
}
