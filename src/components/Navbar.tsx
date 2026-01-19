"use client";

import {useState} from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-blue-200 rounded-full shadow">
      <h1 className="font-bold text-lg text-black">ALGO PLAYGROUND</h1>

      <ul className="flex items-center gap-6 relative">
        <li className="cursor-pointer text-black">Home</li>

        <li
          className="cursor-pointer flex items-center gap-1 text-black"
          onClick={() => setOpen(!open)}
        >
          Algorithms
          <span>▾</span>

          {open && (
            <div className="absolute top-10 left-0 bg-white shadow rounded-md w-44 z-10">
              {[
                "All Algorithms",
                "Linear DS",
                "Tree",
                "Graph",
                "Sorting",
                "Searching",
              ].map((item) => (
                <div
                  key={item}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </li>

        <li className="cursor-pointer text-black">Examples Questions</li>

        <img
          src="https://i.pravatar.cc/150"
          alt="profile"
          className="w-8 h-8 rounded-full"
        />
      </ul>
    </nav>
  );
}
