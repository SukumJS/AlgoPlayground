import { useState, useRef, useEffect } from "react";

const SPEED_MAP = {
  "1x": 1000,
  "2x": 500,
  "5x": 60,
} as const;

export function useSortSpeed() {
  const [speed, setSpeedState] = useState<keyof typeof SPEED_MAP>("1x");
  const [delay, setDelay] = useState<number>(SPEED_MAP["1x"]);

  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  const setSpeed = (newSpeed: keyof typeof SPEED_MAP) => {
    setSpeedState(newSpeed);            
    setDelay(SPEED_MAP[newSpeed]);
  };

  return { delayRef, setSpeed, speed }; 
}