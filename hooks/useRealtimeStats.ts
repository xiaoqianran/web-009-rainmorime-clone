import { useState, useEffect, useRef } from "react";
import type { RealtimeStatsState } from "../types";

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function formatRuntime(uptimeMs: number): string {
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
  return (
    `${String(days).padStart(3, "0")}:` +
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  );
}

const VISIT_KEY = "rm-clone-visits";
const ORIGIN_KEY = "rm-clone-origin";

export default function useRealtimeStats(): RealtimeStatsState {
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [runtime, setRuntime] = useState("000:00:00:00");
  const [totalVisits, setTotalVisits] = useState<number | string>(0);
  const [currentVisitors, setCurrentVisitors] = useState(1);

  const runtimeOriginRef = useRef<{ server: number; local: number } | null>(null);

  useEffect(() => {
    let runtimeInterval: ReturnType<typeof setInterval> | undefined;

    const startRuntimeTick = () => {
      if (runtimeInterval || !runtimeOriginRef.current) return;
      runtimeInterval = setInterval(() => {
        const { server, local } = runtimeOriginRef.current!;
        setRuntime(formatRuntime(server + (Date.now() - local)));
      }, 1000);
    };

    const stopRuntimeTick = () => {
      if (runtimeInterval) {
        clearInterval(runtimeInterval);
        runtimeInterval = undefined;
      }
    };

    try {
      const storedVisits = Number(localStorage.getItem(VISIT_KEY) || "0") + 1;
      localStorage.setItem(VISIT_KEY, String(storedVisits));
      setTotalVisits(storedVisits);

      let origin = Number(localStorage.getItem(ORIGIN_KEY) || "0");
      if (!origin) {
        origin = Date.now();
        localStorage.setItem(ORIGIN_KEY, String(origin));
      }
      runtimeOriginRef.current = { server: Date.now() - origin, local: Date.now() };
      setRuntime(formatRuntime(Date.now() - origin));
      if (!document.hidden) startRuntimeTick();
    } catch {
      runtimeOriginRef.current = { server: 0, local: Date.now() };
      setTotalVisits("N/A");
      if (!document.hidden) startRuntimeTick();
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopRuntimeTick();
      } else {
        if (runtimeOriginRef.current) {
          setRuntime(formatRuntime(
            runtimeOriginRef.current.server + (Date.now() - runtimeOriginRef.current.local)
          ));
        }
        startRuntimeTick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopRuntimeTick();
    };
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startClock = () => {
      if (intervalId) return;
      setCurrentTime(formatTime(new Date()));
      intervalId = setInterval(() => {
        setCurrentTime(formatTime(new Date()));
      }, 1000);
    };

    const stopClock = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stopClock();
      else startClock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    startClock();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopClock();
    };
  }, []);

  return { currentTime, runtime, totalVisits, currentVisitors };
}
