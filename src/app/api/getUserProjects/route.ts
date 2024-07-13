// pages/api/getUserProjects.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/config"; // Adjust the import path as necessary
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 }
    );
  }

  try {
    const userProjectsRef = collection(db, `projects/users/${userId}`);
    const userProjectsSnapshot = await getDocs(userProjectsRef);

    if (userProjectsSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const userProjects = userProjectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(userProjects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: `Failed to fetch user projects: ${error.message}` },
      { status: 500 }
    );
  }
}
