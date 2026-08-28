"use client";

import { useEffect, useState, type ComponentType } from "react";

import type { MapCanvasProps } from "./MapCanvas";

export function MapCanvasLoader(props: MapCanvasProps) {
  const [Canvas, setCanvas] = useState<ComponentType<MapCanvasProps> | null>(
    null,
  );
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const capabilityCheck = window.requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const webGl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!webGl) {
        setCapabilityError(
          "The interactive map is unavailable because this browser cannot start WebGL. Every record remains available in the specimen list.",
        );
        return;
      }
      setCapabilityError(null);
      void import("./MapCanvas")
        .then((mapCanvasModule) => {
          if (!cancelled) setCanvas(() => mapCanvasModule.MapCanvas);
        })
        .catch(() => {
          if (!cancelled) {
            setCapabilityError(
              "The interactive map could not be loaded. Every record remains available in the specimen list.",
            );
          }
        });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(capabilityCheck);
    };
  }, [retryKey]);

  if (capabilityError) {
    return (
      <MapUnavailable
        message={capabilityError}
        onRetry={() => setRetryKey((value) => value + 1)}
      />
    );
  }
  if (!Canvas) {
    return (
      <div className="map-loading" role="status">
        <span aria-hidden="true" />
        Preparing the collection map…
      </div>
    );
  }
  return <Canvas key={retryKey} {...props} />;
}

function MapUnavailable({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="map-unavailable" role="alert">
      <p className="card-overline">Map unavailable</p>
      <h2>The collection list is still available.</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry map
      </button>
    </div>
  );
}
