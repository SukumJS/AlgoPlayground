"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

interface NavbarProps {
  onSelectCategory: (category: string) => void;
}

const subscribeToNoop = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export default function Navbar({ onSelectCategory }: NavbarProps) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  // Auth state is hydrated from localStorage on the client only. Render the
  // signed-out variant during SSR/initial hydration to avoid HTML mismatch.
  const mounted = useSyncExternalStore(
    subscribeToNoop,
    getMountedSnapshot,
    getServerMountedSnapshot,
  );
  const isSignedIn = mounted && Boolean(user);

  const items = [
    { label: "All", value: "all" },
    { label: "Linear DS", value: "linear-ds" },
    { label: "Tree", value: "tree" },
    { label: "Graph", value: "graph" },
    { label: "Sorting", value: "sorting" },
    { label: "Searching", value: "searching" },
  ];

  const handleSignOut = async () => {
    await logout();
    setProfileOpen(false);
    router.push("/auth/signin");
  };

  return (
    <div className="sticky top-[30px] z-50 flex justify-center">
      <div
        className="
          w-full max-w-[1380px] mx-2 md:mx-0
          h-[80px]
          px-4 md:px-8
          flex items-center
          rounded-[50px]
          bg-[#B4D4F1]
          border border-[#5D5D5D]
          shadow-[0px_6px_18px_rgba(0,0,0,0.25)]
        "
      >
        {/* Logo */}
        <Link href="/">
          <div className="text-base md:text-xl font-bold uppercase text-[#222121] cursor-pointer transition-opacity whitespace-nowrap">
            Algo playground
          </div>
        </Link>

        <div className="flex-1" />
        <div className="flex items-center gap-1 md:gap-4">
          <button className="px-2 py-2 text-base md:text-lg font-bold text-[#222121] capitalize">
            <Link href="/">Home</Link>
          </button>

          {/* Dropdown */}
          <div className="relative md:min-w-32">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-2 py-2 text-base md:text-lg font-bold capitalize"
            >
              <span className="text-[#222121] hover:text-[#5D5D5D] transition-colors ">
                {selected === "all"
                  ? "Explore"
                  : items.find((item) => item.value === selected)?.label}
              </span>

              <ChevronUp
                size={20}
                className={`transition-transform ${
                  open ? "rotate-0" : "rotate-180"
                } text-[#222121]`}
              />
            </button>

            {open && (
              <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl shadow-lg">
                {items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setSelected(item.value);
                      onSelectCategory(item.value);
                      setOpen(false);
                    }}
                    className={`px-3 py-2 text-center cursor-pointer hover:bg-[#E6EEF7]
                      ${
                        selected === item.value
                          ? "font-bold text-[#1A75D1]"
                          : "text-[#222121]"
                      }
                    `}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="py-2 text-base md:text-lg font-bold text-[#222121] capitalize whitespace-nowrap">
            <a href="/exercise">examples questions</a>
          </button>
        </div>

        {/* Auth section */}
        <div className="ml-2 md:ml-4">
          {loading ? (
            <div className="w-12 h-12 rounded-full bg-[#9EC5E8] animate-pulse" />
          ) : !user ? (
            <Link href="/auth/signin">
              <button className="px-6 py-2 rounded-full bg-[#1A75D1] text-[#F1F1F1] font-bold shadow-md">
                Sign in
              </button>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-12 h-12 rounded-full overflow-hidden border border-[#5D5D5D]"
              >
                <img
                  src={user?.imageUrl ?? "@/src/data/default-profile.png"}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 w-40 mt-2 bg-white shadow-lg rounded-xl">
                  <Link href="/profile">
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full h-10 flex items-center justify-center hover:bg-[#E6EEF7] text-[#222121]"
                    >
                      Profile
                    </button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full h-10 flex items-center justify-center hover:bg-[#E6EEF7] text-[#222121]"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
