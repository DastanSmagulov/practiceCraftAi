"use client";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="navbar bg-base-100 text-white px-20">
      <div className="navbar-start">
        <Link href={"/"} className="text-lg font-bold hover:text-slate-300">
          PracticeCraft.AI
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href={"/projects"} className="text-base font-bold">
              Projects
            </Link>
          </li>
          <li>
            <Link href={"/discuss"} className="text-base font-bold">
              Discuss
            </Link>
          </li>
          <li>
            <Link href={"/create"} className="text-base font-bold">
              Create your own project
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <details className="dropdown bg-transparent">
          <summary>
            <button className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Profile"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                />
              </div>
            </button>
          </summary>
          <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-28 p-2 shadow">
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Log Out</a>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default Header;
