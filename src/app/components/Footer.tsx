"use client";
import React from "react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-300 min-h-[10vh] flex justify-center items-center text-xl py-6">
      <div className="container w-[80vw] m-auto">
        <div className="flex flex-col xl:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-sm font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} PracticeCraft.AI. All rights
            reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 md:space-x-6 text-center">
            <Link
              href="https://discord.gg/9GPQEDht"
              className="flex items-center text-sm font-medium hover:text-slate-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="mr-2" size={20} />
              Join the community on Discord
            </Link>
            <a
              href="mailto:barniestinson11@gmail.com"
              className="text-sm font-medium hover:text-slate-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Questions or Cooperation: barniestinson11@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
