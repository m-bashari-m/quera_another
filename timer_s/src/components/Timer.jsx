import { useState, useEffect, useRef } from "react";

function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState([]);
  const intervalIdRef = useRef(null);
  const startTimeRef = useRef(0);

  function formatTime() {
    const totalMilliseconds = elapsedTime;
    const minutes = String(
      Math.floor(totalMilliseconds / (60 * 1000))
    ).padStart(2, "0");
    const seconds = String(
      Math.floor((totalMilliseconds % (60 * 1000)) / 1000)
    ).padStart(2, "0");
    const centiseconds = String(
      Math.floor((totalMilliseconds % 1000) / 10)
    ).padStart(2, "0");
    return `${minutes}:${seconds}:${centiseconds}`;
  }

  function startTimer() {
    if (!intervalIdRef.current) {
      startTimeRef.current = Date.now() - elapsedTime;
      intervalIdRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10);
      setIsRunning(true);
    }
  }

  function stopTimer() {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setIsRunning(false);
    }
  }

  function toggleTimer() {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  function reset() {
    stopTimer();
    setElapsedTime(0);
  }

  function logTime() {
    setLogs([...logs, formatTime()]);
  }

  function deleteLogs() {
    setLogs([]);
  }

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        startTimer();
      } else {
        stopTimer();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    startTimer();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      stopTimer();
    };
  }, []);

  return (
    <div>
      <h1 data-testid="Timer">{formatTime()}</h1>
      <button data-testid="toggle-button" onClick={toggleTimer}>
        {isRunning ? "Stop" : "Start"}
      </button>
      <button data-testid="reset-button" onClick={reset}>
        Reset
      </button>
      <button data-testid="log-button" onClick={logTime}>
        Log Time
      </button>
      <h3>Logged Times:</h3>
      <button
        data-testid="delete-logs"
        className="delete"
        onClick={deleteLogs}
        style={{ display: logs.length > 0 ? "inline-block" : "none" }}
      >
        delete logs
      </button>
      <ul>
        {logs.map((time, index) => (
          <li key={index}>{time}</li>
        ))}
      </ul>
    </div>
  );
}

export default Timer;
