"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, db, storage } from "../firebase/config";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

interface Project {
  name: string;
  stack: string;
  topics: string;
  difficulty: string;
  done: boolean;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [solvedCount, setSolvedCount] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Saving state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setNewName(userData.displayName);
      fetchProjects(userData.uid);
    } else {
      setLoading(false); // No user data, stop loading
    }
  }, []);

  const fetchProjects = async (userId: string) => {
    try {
      const response = await axios.get("/api/getUserProjects", {
        params: { userId },
      });
      const userProjects = response.data;
      setProjects(userProjects);
      calculateSolvedCount(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false); // Data fetch complete, stop loading
    }
  };

  const calculateSolvedCount = (projects: Project[]) => {
    const solved = projects.filter((project) => project.done);
    const easy = solved.filter(
      (project) => project.difficulty === "easy"
    ).length;
    const medium = solved.filter(
      (project) => project.difficulty === "medium"
    ).length;
    const hard = solved.filter(
      (project) => project.difficulty === "hard"
    ).length;
    setSolvedCount({ easy, medium, hard });
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true); // Start saving
    try {
      let updatedPhotoURL = user.photoURL;

      if (newPhoto) {
        const photoRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(photoRef, newPhoto);
        updatedPhotoURL = await getDownloadURL(photoRef);
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found.");
      }

      // Update profile in Firebase Authentication
      await updateProfile(currentUser, {
        displayName: newName,
        photoURL: updatedPhotoURL,
      });

      // Update user in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: newName,
        photoURL: updatedPhotoURL,
      });

      // Update local state and localStorage
      const updatedUser = {
        ...user,
        displayName: newName,
        photoURL: updatedPhotoURL,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false); // End saving
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] min-h-[80vh] h-auto flex flex-col items-center justify-center text-white p-4">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md mb-6">
        <div className="flex items-center">
          <img
            src={user.photoURL ? user.photoURL : "/avatar.png"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            {editing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-gray-700 rounded p-2 text-white"
              />
            ) : (
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
            )}
            <p className="email-text">{user.email}</p>
          </div>
        </div>
        {editing && (
          <div className="mt-4">
            <label className="block mb-2">New Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewPhoto(e.target.files ? e.target.files[0] : null)
              }
              className="block mb-2"
            />
          </div>
        )}
        <div className="flex justify-end mt-4">
          {editing ? (
            <>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition duration-300 mr-2"
                onClick={handleSaveChanges}
                disabled={saving} // Disable button when saving
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-600 transition duration-300"
                onClick={() => setEditing(false)}
                disabled={saving} // Disable button when saving
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-orange-600 transition duration-300"
              onClick={handleEditClick}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Solved Projects</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="text-green-400">Easy: {solvedCount.easy}</div>
          <div className="text-yellow-400">Medium: {solvedCount.medium}</div>
          <div className="text-red-400">Hard: {solvedCount.hard}</div>
        </div>
        <div className="text-4xl font-bold text-white">
          {solvedCount.easy + solvedCount.medium + solvedCount.hard} /{" "}
          {projects.length}
        </div>
        <p className="text-gray-400 mt-2">Total Solved / Total Projects</p>
      </div>
    </div>
  );
};

export default Profile;
