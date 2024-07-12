"use client";
import React, { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] min-h-screen flex items-center justify-center text-white">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-black text-2xl text-center">
          This page is currently in developement
        </h1>
      </div>
    </div>
  );
};

export default Profile;
