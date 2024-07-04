"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config";

const Header: React.FC<{ active: string }> = (props) => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    auth.signOut().then(() => {
      setUser(null);
      localStorage.removeItem("user");
    });
  };

  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar justify-between bg-base-300 w-full">
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
          <div className="mx-2 pl-20">
            <Link
              href={"/"}
              className="text-lg max-sm:text-base font-bold hover:text-slate-300"
            >
              PracticeCraft.AI
            </Link>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal px-1">
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
                  href={"/discuss"}
                  className={`text-base font-bold ${
                    props.active === "discuss" ? "underline" : ""
                  }`}
                >
                  Discuss
                </Link>
              </li>
              <li>
                <Link
                  href={"/create"}
                  className={`text-base font-bold ${
                    props.active === "create" ? "underline" : ""
                  }`}
                >
                  Create your own project
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:pr-20 max-sm:hidden relative">
            {user ? (
              <div className="relative">
                <button
                  className="btn btn-ghost btn-circle avatar"
                  onClick={handleDropdownToggle}
                >
                  <div className="w-10 rounded-full">
                    <img alt="Profile" src={user.photoURL} />
                  </div>
                </button>
                {dropdownOpen && (
                  <ul className="menu dropdown-content bg-base-100 rounded-box absolute right-0 z-[1] w-28 p-2 shadow">
                    <li>
                      <Link href={"/profile"}>Profile</Link>
                    </li>
                    <li>
                      <a onClick={handleSignOut}>Log Out</a>
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
              href={"/discuss"}
              className={`text-base font-bold ${
                props.active === "discuss" ? "underline" : ""
              }`}
            >
              Discuss
            </Link>
          </li>
          <li>
            <Link
              href={"/create"}
              className={`text-base font-bold ${
                props.active === "create" ? "underline" : ""
              }`}
            >
              Create your own project
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
