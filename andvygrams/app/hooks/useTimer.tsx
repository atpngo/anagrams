import { useCallback, useEffect, useState } from "react";

const interval = (delay: number = 0) => (callback: () => void) =>
  useEffect(() => {
    const id = setInterval(callback, delay);

    return () => clearInterval(id);
  }, [callback]);

const use1Second = interval(1000);

export const useTimer = (
  callback: (arg: () => void) => void,
  initialSeconds: number = 0,
  initiallyRunning: boolean = false,
) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(initiallyRunning);
  const [initialTime, setInitialTime] = useState(Date.now());
  const start = () => { 
    setRunning(true);
    setInitialTime(Date.now());
  }
  const pause = () => setRunning(false);
  const reset = () => {
    setSeconds(initialSeconds) 
    setInitialTime(Date.now());
  }

  const stop = () => {
    pause();
    reset();
  };


  const tick = useCallback(
    () => (running ? setSeconds((seconds) => {
        if (seconds > 0)
        {
            const elapsedSeconds = Math.floor((Date.now() - initialTime)/1000);
            return totalSeconds - elapsedSeconds;
        }
        if (seconds == 0)
        {
            callback(stop);
        }
        return 0;
    }) : undefined),
    [running]
  );
  

  use1Second(tick);

  return { seconds, start, stop };
};
