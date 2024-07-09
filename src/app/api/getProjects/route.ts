import { NextRequest, NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { realtimeDB } from "../../firebase/config"; // Adjust the import path as necessary

export async function GET(request: NextRequest) {
  try {
    const dbRef = ref(realtimeDB, "projects");
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      throw new Error("No data available");
    }

    const projects = snapshot.val();
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
