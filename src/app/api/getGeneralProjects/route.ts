import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/config"; // Adjust the import path as necessary
import { collection, getDocs } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const generalProjectsRef = collection(db, "projects", "general", "data");
    const generalProjectsSnapshot = await getDocs(generalProjectsRef);

    if (generalProjectsSnapshot.empty) {
      return NextResponse.json(
        { error: "No general projects available" },
        { status: 404 }
      );
    }

    const generalProjects = generalProjectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(generalProjects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching general projects:", error);
    return NextResponse.json(
      { error: `Failed to fetch general projects: ${error.message}` },
      { status: 500 }
    );
  }
}
