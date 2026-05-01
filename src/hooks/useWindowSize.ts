"use client";

import { useEffect, useState } from "react";

export type WindowSize = {
  width: number;
  height: number;
};

/**
 * Track the current viewport dimensions. SSR-safe — returns 0×0 on the
 * server, then syncs to real values on mount.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
