import { useRef } from "react";

type TimerID = number | null;
type SetDebouncer = (callback: () => void, timerInMs: number) => void;

export default function useDebounce(): [TimerID, SetDebouncer] {
  const timerRef = useRef<TimerID>(null);
  const setTimer: SetDebouncer = (callback: () => void, timerInMs: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      console.log("Fired in useDebouncer");
      callback();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = null;
    }, timerInMs);
  };
  return [timerRef.current, setTimer];
}
