"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider, db } from "../firebase/config";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          const userData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          await checkAndCreateUser(userData);
          router.push("/projects");
        } else {
          setMessage({
            type: "error",
            text: "Please verify your email address.",
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const checkAndCreateUser = async (userData: any) => {
    const userRef = doc(db, "users", userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: userData.uid,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
      });
    } else {
      const existingUserData = userSnap.data();
      if (!existingUserData.photoURL && userData.photoURL) {
        await setDoc(
          userRef,
          {
            photoURL: userData.photoURL,
          },
          { merge: true }
        );
      }
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      await checkAndCreateUser(userData);
      router.push("/projects");
    } catch (err: any) {
      console.error("Error during GitHub login:", err);
      setMessage({
        type: "error",
        text:
          err.code === "auth/popup-blocked"
            ? "Popup blocked by the browser. Please reload the page or allow popups in browser settings."
            : err.code === "auth/popup-closed-by-user"
            ? "Popup closed by the user. Please reload the page."
            : "Failed to log in with GitHub. Please try again. Error: " +
              err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(result.user);
      setMessage({
        type: "success",
        text: "Verification email sent. Please check your inbox.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
      console.error("Error during sign-up:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.emailVerified) {
        const userData = {
          uid: result.user.uid,
          displayName: result.user.displayName || "Anonymous",
          email: result.user.email,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        await checkAndCreateUser(userData);
        router.push("/projects");
      } else {
        setMessage({
          type: "error",
          text: "Please verify your email address.",
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
      console.error("Error during sign-in:", err);
    } finally {
      setLoading(false);
    }
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

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error clearing persistent state: ", error);
    });
  };

  return (
    <div className="wrapper flex items-center justify-center h-screen bg-cover bg-center">
      <div className="box text-center bg-white p-10 rounded-lg shadow-lg max-w-sm">
        {user ? (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Welcome, {user.displayName}!
            </h1>
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
            <p className="text-lg text-gray-700 mb-6">
              You are now signed in. Enjoy using our platform!
            </p>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-600 transition duration-300 font-bold"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Sign in to Your Account
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up to access all the functionality and start your journey
              with us.
            </p>
            <button
              className="flex items-center justify-center bg-orange-500 text-white px-6 py-3 text-lg rounded-full shadow-md hover:bg-orange-600 transition duration-300 font-bold w-full mb-4"
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
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border text-slate-600 border-gray-300 rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 border text-slate-600 border-gray-300 rounded-lg"
              />
              <button
                className="w-full bg-green-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 transition duration-300 font-bold mb-4"
                onClick={handleEmailSignUp}
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up with Email"}
              </button>
              <button
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition duration-300 font-bold"
                onClick={handleEmailSignIn}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In with Email"}
              </button>
            </div>
            {message.text && (
              <p
                className={`${
                  message.type === "error" ? "text-red-500" : "text-green-500"
                } mt-4`}
              >
                {message.text}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
