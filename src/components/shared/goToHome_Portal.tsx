import React from "react";
import Link from "next/link";
import { ChevronLeft, House } from "lucide-react";

// type Props = {}

export default function GoToHome_Portal() {
  return (
    <Link href="/">
      <button className="bg-white p-2 rounded-full shadow-lg flex items-center font-semibold border border-gray-200 hover:shadow-lg hover:bg-gray-100 transition cursor-pointer">
        <House color="#000000" />
      </button>
    </Link>
  );
}
