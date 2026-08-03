import { useState, useEffect } from 'react';

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(prev => !prev);
  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  const formattedTime = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return {
    seconds,
    isRunning,
    formattedTime,
    toggleTimer,
    resetTimer
  };
}
