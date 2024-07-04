"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleGithubLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const userData = {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        router.push("/projects");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="wrapper flex items-center justify-center h-screen">
      <div className="box text-center">
        {user ? (
          <>
            <h1>Login successfully</h1>
          </>
        ) : (
          <>
            <p className="mb-4 text-xl">
              Sign up to access all the functionality
            </p>
            <button
              className="bg-orange-500 text-grey-700 text-white px-6 py-3 text-lg rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold"
              onClick={handleGithubLogin}
            >
              Sign In With GitHub
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
