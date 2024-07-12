"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "../firebase/config";
import {
  signInWithPopup,
  GithubAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      router.push("/projects");
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        router.push("/projects");
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGithubLogin = () => {
    setLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        const userData = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        router.push("/projects");
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error during GitHub login:", err);
        alert(
          "Failed to log in with GitHub. Please try again. Error: " +
            err.message
        );
      });
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        localStorage.removeItem("user");
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
        alert("Error signing out. Please try again.");
      });

    // Clear persistent state
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Persistent state cleared
      })
      .catch((error) => {
        console.error("Error clearing persistent state: ", error);
      });
  };

  return (
    <div
      className="wrapper flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/path/to/your/background.jpg')" }}
    >
      <div className="box text-center bg-white p-8 rounded-lg shadow-lg max-w-sm">
        {user ? (
          <>
            <h1 className="text-2xl font-bold text-green-500">
              Login successful
            </h1>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <p className="mb-6 text-2xl text-gray-800 font-semibold">
              Sign up to access all the functionality
            </p>
            <button
              className="flex items-center justify-center bg-orange-500 text-white px-6 py-3 text-lg rounded-md shadow-md hover:bg-orange-600 transition duration-300 font-bold w-full"
              onClick={handleGithubLogin}
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mr-3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                <>Sign In With GitHub</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
