"use client";

import React, { useSyncExternalStore } from "react";
import { Monitor } from "lucide-react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getServerSnapshot = () => false;

/**
 * Block usage on phone-sized viewports. AlgoPlayground requires a wider
 * screen for the canvas-based visualizations to work, so we render a
 * "desktop required" message instead of the app on small screens.
 */
export default function MobileBlocker({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#F0F5EC] px-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-4 text-[#5D5D5D]">
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8" strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-wide">
              DESKTOP VIEW RECOMMENDED
            </h1>
          </div>
          <p className="text-base leading-relaxed">
            Our Algo Playground allows for complex visualizations that require a
            larger screen. For the best learning experience, please access this
            site from a desktop or laptop computer.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
