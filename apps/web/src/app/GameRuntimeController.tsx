import { useEffect } from "react";
import {
  type GameRuntime,
  SAVE_INTERVAL_MS,
  SIMULATION_INTERVAL_MS,
} from "@/game";

interface Props {
  readonly runtime: GameRuntime;
}

export function GameRuntimeController({ runtime }: Props) {
  useEffect(() => {
    void runtime.initialize();

    const simulationTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        runtime.tick();
      }
    }, SIMULATION_INTERVAL_MS);

    const saveTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void runtime.save();
      }
    }, SAVE_INTERVAL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        runtime.resume();
      } else {
        runtime.suspend();
      }
    }

    function onPageHide() {
      if (document.visibilityState === "visible") {
        runtime.suspend();
      } else {
        void runtime.save();
      }
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted && document.visibilityState === "visible") {
        runtime.resume();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearInterval(simulationTimer);
      window.clearInterval(saveTimer);

      document.removeEventListener("visibilitychange", onVisibilityChange);

      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [runtime]);

  return null;
}
