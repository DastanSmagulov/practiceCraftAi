"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";

const Header: React.FC<{ active: string }> = (props) => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        localStorage.clear();
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
        alert("Error signing out. Please try again.");
      });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="drawer min-h-[10vh]">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar min-h-[10vh] justify-between bg-base-300 w-full px-4 lg:px-20">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div>
            <Link
              href={"/projects"}
              className="text-xl max-sm:text-base font-bold hover:text-slate-300"
            >
              PracticeCraft.AI
            </Link>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal px-1 text-lg font-bold">
              <li>
                <Link
                  href={"/projects"}
                  className={`${
                    props.active === "projects" ? "underline" : ""
                  }`}
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href={"https://discord.gg/H2pGWa6d6C"}
                  className={`${props.active === "discuss" ? "underline" : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discuss
                </Link>
              </li>
            </ul>
          </div>
          <div className="relative">
            {user ? (
              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={handleDropdownToggle}
                >
                  <h1 className="text-lg font-bold max-md:hidden">
                    {user.displayName}
                  </h1>
                  <button className="btn btn-ghost btn-circle avatar">
                    <div className="w-12 rounded-full">
                      <img alt="Profile" src={user.photoURL} />
                    </div>
                  </button>
                </div>
                {dropdownOpen && (
                  <ul
                    ref={dropdownRef}
                    className="absolute right-4 mt-2 w-32 max-md:w-28 rounded-2xl bg-base-100 rounded-lg shadow-lg z-[1] p-2 space-y-2 transition-all duration-300"
                  >
                    <li className="hover:bg-gray-700 rounded-md p-2 transition-colors duration-300">
                      <Link href={"/profile"}>Profile</Link>
                    </li>
                    <li className="hover:bg-gray-700 rounded-md p-2 transition-colors duration-300">
                      <Link onClick={handleSignOut} href={"/"}>
                        Log Out
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link href={"/login"} className="btn btn-ghost">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <li>
            <Link
              href={"/projects"}
              className={`text-base font-bold ${
                props.active === "projects" ? "underline" : ""
              }`}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              href={"https://discord.gg/H2pGWa6d6C"}
              className={`text-base font-bold ${
                props.active === "discuss" ? "underline" : ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discuss
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
