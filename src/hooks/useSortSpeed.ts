import { useState, useRef, useEffect } from "react";

const SPEED_MAP = {
  "1x": 1000,
  "2x": 500,
  "5x": 60,
} as const;

export function useSortSpeed() {
  const [delay, setDelay] = useState(1000);
  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  const setSpeed = (speed: keyof typeof SPEED_MAP) => {
    setDelay(SPEED_MAP[speed]);
  };

  return { delayRef, setSpeed };
}
