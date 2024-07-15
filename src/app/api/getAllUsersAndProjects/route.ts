// // pages/api/getAllUsersAndProjects.ts
// import { NextRequest, NextResponse } from "next/server";
// import admin from "../../firebase/admin";
// import { db } from "../../firebase/config";
// import { collection, getDocs } from "firebase/firestore";

// export async function GET(request: NextRequest) {
//   try {
//     const listUsersResult = await admin.auth().listUsers();
//     const usersData = await Promise.all(
//       listUsersResult.users.map(async (userRecord) => {
//         const userId = userRecord.uid;
//         const userData = {
//           uid: userRecord.uid,
//           email: userRecord.email,
//           displayName: userRecord.displayName,
//           photoURL: userRecord.photoURL,
//         };

//         // Fetch projects for each user
//         const userProjectsRef = collection(db, `projects/users/${userId}`);
//         const userProjectsSnapshot = await getDocs(userProjectsRef);

//         const userProjects = userProjectsSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         return {
//           ...userData,
//           projects: userProjects,
//         };
//       })
//     );

//     return NextResponse.json(usersData, { status: 200 });
//   } catch (error: any) {
//     console.error("Error fetching users and projects:", error);
//     return NextResponse.json(
//       { error: `Failed to fetch users and projects: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }
