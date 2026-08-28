"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
  type WheelEvent,
} from "react";
import { createPortal } from "react-dom";
import maplibregl, {
  type FilterSpecification,
  type GeoJSONSource,
  type LngLatLike,
  type Map as MapLibreMap,
  type SymbolLayerSpecification,
} from "maplibre-gl";

import {
  createUncertaintyPolygon,
  isMappedRecord,
} from "@/domain/map/projection";
import type {
  MapFeatureCollection,
  MapPolygonFeatureCollection,
  MapRecord,
} from "@/domain/map/types";

import { ClusterMapPopup, IndividualMapPopup } from "./MapPopup";
import { getMapStyle, type MapStyleKey } from "./provider";

export interface MapCanvasProps {
  records: MapRecord[];
  selectedSpecimenId: string | null;
  styleKey: MapStyleKey;
  showUncertainty: boolean;
  resetToken: number;
  fitOnPopupClose: boolean;
  onSelect: (specimenId: string) => void;
  onClearSelection: () => void;
  onStatus: (message: string) => void;
}

type PopupState =
  | { kind: "record"; record: MapRecord; longitude: number; latitude: number }
  | {
      kind: "cluster";
      records: MapRecord[];
      longitude: number;
      latitude: number;
    }
  | null;

interface AccessibleCluster {
  id: number;
  count: number;
  longitude: number;
  latitude: number;
  x: number;
  y: number;
}

interface CameraView {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

const pointSourceId = "specimen-points";
const uncertaintySourceId = "specimen-uncertainty";
const clusterLayerId = "specimen-clusters";
const clusterCountLayerId = "specimen-cluster-count";
const mammalLayerId = "specimen-mammals";
const birdLayerId = "specimen-birds";
const otherLayerId = "specimen-other";
const approximateLayerId = "specimen-approximate";
const selectedLayerId = "specimen-selected";
// MapLibre measures this in screen pixels; keep it close to the marker footprint.
const mapClusterRadius = 24;
const defaultMapCenter: [number, number] = [9.2, 56.05];
const defaultMapZoom = 6.1;
// Normalize the visible alpha bounds of the reviewed assets; the bird profile
// is shorter inside its transparent square than the front-facing mammal head.
const mammalIconSize = 0.56;
const birdIconSize = 0.675;
const pointLayerIds = [
  mammalLayerId,
  birdLayerId,
  otherLayerId,
  approximateLayerId,
];

export function MapCanvas({
  records,
  selectedSpecimenId,
  styleKey,
  showUncertainty,
  resetToken,
  fitOnPopupClose,
  onSelect,
  onClearSelection,
  onStatus,
}: MapCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupAnchorRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const recordsRef = useRef(records);
  const onSelectRef = useRef(onSelect);
  const onStatusRef = useRef(onStatus);
  const lastFocusedSpecimenRef = useRef<string | null>(null);
  const popupRef = useRef<PopupState>(null);
  const popupOpenerRef = useRef<HTMLElement | null>(null);
  const accessibleClusterSignatureRef = useRef("");
  const appliedRecordSignatureRef = useRef("");
  const [ready, setReady] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [popup, setPopup] = useState<PopupState>(null);
  const [popupPixel, setPopupPixel] = useState({
    x: 0,
    y: 0,
  });
  const [accessibleClusters, setAccessibleClusters] = useState<
    AccessibleCluster[]
  >([]);
  const [canvasContainer, setCanvasContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);
  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const containPopupWheel = (event: globalThis.WheelEvent) => {
      if (!isPopupInteractionTarget(event.target)) return;
      if (isClusterListTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const containPopupTouch = (event: globalThis.TouchEvent) => {
      if (!isPopupInteractionTarget(event.target)) return;
      if (isClusterListTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    frame.addEventListener("wheel", containPopupWheel, {
      capture: true,
      passive: false,
    });
    frame.addEventListener("touchmove", containPopupTouch, {
      capture: true,
      passive: false,
    });
    return () => {
      frame.removeEventListener("wheel", containPopupWheel, true);
      frame.removeEventListener("touchmove", containPopupTouch, true);
    };
  }, []);

  const mappedRecords = useMemo(
    () => records.filter(isMappedRecord),
    [records],
  );
  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.specimenId, record])),
    [records],
  );
  const recordSignature = useMemo(
    () =>
      [...records]
        .sort((first, second) =>
          first.specimenId.localeCompare(second.specimenId, "en"),
        )
        .map(
          (record) =>
            `${record.specimenId}:${record.longitude ?? ""}:${record.latitude ?? ""}:${record.coordinatePrecision}`,
        )
        .join("|"),
    [records],
  );
  const recordSignatureRef = useRef(recordSignature);
  useEffect(() => {
    recordSignatureRef.current = recordSignature;
  }, [recordSignature]);
  const visibleUncertaintyCount = records.filter(
    (record) =>
      record.coordinatePrecision === "approximate" &&
      (record.coordinateUncertaintyM ?? 0) > 0 &&
      (showUncertainty || record.specimenId === selectedSpecimenId),
  ).length;

  const updatePopupPosition = useCallback(() => {
    const map = mapRef.current;
    const currentPopup = popupRef.current;
    if (!map || !currentPopup) return;
    const point = map.project([currentPopup.longitude, currentPopup.latitude]);
    setPopupPixel({
      x: point.x,
      y: point.y,
    });
  }, []);

  const updateMapView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    cameraRef.current = {
      center: [center.lng, center.lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };
    const frame = frameRef.current;
    if (frame) {
      frame.dataset.mapCenter = `${center.lng.toFixed(6)},${center.lat.toFixed(6)}`;
      frame.dataset.mapZoom = map.getZoom().toFixed(4);
    }
    updatePopupPosition();
  }, [updatePopupPosition]);

  const rememberPopupOpener = useCallback((element?: HTMLElement | null) => {
    const candidate = element ?? document.activeElement;
    if (
      candidate instanceof HTMLElement &&
      candidate !== document.body &&
      candidate.isConnected
    ) {
      popupOpenerRef.current = candidate;
    }
  }, []);

  const restorePopupFocus = useCallback(() => {
    const opener = popupOpenerRef.current;
    popupOpenerRef.current = null;
    if (!opener?.isConnected) return;
    window.requestAnimationFrame(() => opener.focus({ preventScroll: true }));
  }, []);

  const closeRecordPopup = useCallback(() => {
    const map = mapRef.current;
    setPopup(null);
    onClearSelection();
    if (fitOnPopupClose && map) {
      fitRecords(map, recordsRef.current, prefersReducedMotion());
    }
    restorePopupFocus();
  }, [fitOnPopupClose, onClearSelection, restorePopupFocus]);

  const handlePopupWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isClusterListTarget(event.target)) event.preventDefault();
  }, []);

  const handlePopupTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!isClusterListTarget(event.target)) event.preventDefault();
    },
    [],
  );

  const openCluster = useCallback(
    (
      clusterId: number,
      pointCount: number,
      longitude: number,
      latitude: number,
    ) => {
      const map = mapRef.current;
      const source = map?.getSource(pointSourceId) as GeoJSONSource | undefined;
      if (!source) return;
      void source.getClusterLeaves(clusterId, pointCount, 0).then((leaves) => {
        const ids = leaves.map((leaf) => String(leaf.properties?.specimenId));
        const clusterRecords = ids.flatMap((id) => {
          const record = recordsRef.current.find(
            (candidate) => candidate.specimenId === id,
          );
          return record ? [record] : [];
        });
        setPopup({
          kind: "cluster",
          records: clusterRecords,
          longitude,
          latitude,
        });
        onStatusRef.current(
          `${clusterRecords.length} specimens are available in the selected map cluster.`,
        );
      });
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const savedCamera = cameraRef.current;
    let loaded = false;
    setReady(false);
    setProviderError(null);
    setCanvasContainer(null);
    const map = new maplibregl.Map({
      container,
      style: getMapStyle(styleKey).styleUrl,
      center: savedCamera?.center ?? defaultMapCenter,
      zoom: savedCamera?.zoom ?? defaultMapZoom,
      bearing: savedCamera?.bearing ?? 0,
      pitch: savedCamera?.pitch ?? 0,
      attributionControl: false,
      maxPitch: 0,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
      cooperativeGestures: false,
    });
    mapRef.current = map;
    setCanvasContainer(map.getCanvasContainer());
    map.on("styleimagemissing", (event) => {
      if (!map.hasImage(event.id)) {
        map.addImage(event.id, transparentImage());
      }
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-left",
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: false }),
      "bottom-left",
    );
    map
      .getCanvas()
      .setAttribute(
        "aria-label",
        "Interactive specimen map. Use the adjacent specimen list for complete keyboard access.",
      );

    const failTimer = window.setTimeout(() => {
      if (!loaded) {
        setProviderError(
          "The basemap provider did not respond. Search, filters, and every exact specimen link remain available.",
        );
      }
    }, 12_000);

    map.on("load", () => {
      loaded = true;
      window.clearTimeout(failTimer);
      void addCollectionLayers(
        map,
        buildPointCollection(recordsRef.current),
        emptyPolygons(),
      )
        .then(() => {
          if (mapRef.current !== map) return;
          attachMapInteractions(map, openCluster, onSelectRef);
          appliedRecordSignatureRef.current = recordSignatureRef.current;
          setReady(true);
          if (!savedCamera) fitRecords(map, recordsRef.current, false);
          updateMapView();
        })
        .catch(() => {
          if (mapRef.current !== map) return;
          setProviderError(
            "The collection map could not render its specimen layer. Search, filters, and every exact specimen link remain available.",
          );
        });
    });
    map.on("error", () => {
      if (!loaded) {
        window.clearTimeout(failTimer);
        setProviderError(
          "The selected basemap style could not be loaded. Search, filters, and every exact specimen link remain available.",
        );
      }
    });
    map.on("move", updateMapView);
    map.on("resize", updateMapView);
    const updateClusters = () => {
      const clusters = renderedClusters(map);
      const signature = clusters
        .map(
          (cluster) =>
            `${cluster.id}:${cluster.count}:${cluster.x}:${cluster.y}`,
        )
        .join("|");
      if (signature === accessibleClusterSignatureRef.current) return;
      accessibleClusterSignatureRef.current = signature;
      setAccessibleClusters(clusters);
    };
    const clearClusters = () => {
      accessibleClusterSignatureRef.current = "";
      setAccessibleClusters([]);
    };
    map.on("idle", updateClusters);
    map.on("render", updateClusters);
    map.on("sourcedata", updateClusters);
    map.on("movestart", clearClusters);
    map.on("moveend", updateClusters);
    const clusterRefreshTimer = window.setInterval(updateClusters, 250);

    return () => {
      window.clearTimeout(failTimer);
      window.clearInterval(clusterRefreshTimer);
      map.remove();
      mapRef.current = null;
      setCanvasContainer(null);
      accessibleClusterSignatureRef.current = "";
      setAccessibleClusters([]);
      setReady(false);
    };
  }, [openCluster, retryKey, styleKey, updateMapView]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      !map ||
      !ready ||
      !map.getLayer(selectedLayerId) ||
      appliedRecordSignatureRef.current === recordSignature
    )
      return;
    const source = map.getSource(pointSourceId) as GeoJSONSource | undefined;
    source?.setData(buildPointCollection(records));
    fitRecords(map, records, prefersReducedMotion());
    appliedRecordSignatureRef.current = recordSignature;
  }, [ready, recordSignature, records]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(selectedLayerId)) return;
    const polygons = buildUncertaintyCollection(
      records,
      selectedSpecimenId,
      showUncertainty,
    );
    const source = map.getSource(uncertaintySourceId) as
      GeoJSONSource | undefined;
    source?.setData(polygons);
    map.setFilter(selectedLayerId, [
      "==",
      ["get", "specimenId"],
      selectedSpecimenId ?? "",
    ]);
  }, [ready, records, selectedSpecimenId, showUncertainty]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const synchronize = window.setTimeout(() => {
      if (!selectedSpecimenId) {
        lastFocusedSpecimenRef.current = null;
        setPopup((current) => (current?.kind === "record" ? null : current));
        return;
      }
      const record = recordsById.get(selectedSpecimenId);
      if (!record || !isMappedRecord(record)) return;
      if (!popupRef.current) rememberPopupOpener();
      setPopup({
        kind: "record",
        record,
        longitude: record.longitude,
        latitude: record.latitude,
      });
      if (lastFocusedSpecimenRef.current !== selectedSpecimenId) {
        lastFocusedSpecimenRef.current = selectedSpecimenId;
        map.easeTo({
          center: [record.longitude, record.latitude],
          zoom: Math.max(map.getZoom(), 12.25),
          duration: prefersReducedMotion() ? 0 : 550,
          padding: popupCameraPadding(containerRef.current),
        });
      }
    }, 0);
    return () => window.clearTimeout(synchronize);
  }, [ready, recordsById, rememberPopupOpener, selectedSpecimenId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || resetToken === 0) return;
    fitRecords(map, recordsRef.current, prefersReducedMotion());
    onStatusRef.current("Map view reset to the current mapped results.");
  }, [ready, resetToken]);

  useEffect(() => updatePopupPosition(), [popup, updatePopupPosition]);

  useEffect(() => {
    const anchor = popupAnchorRef.current;
    const frame = frameRef.current;
    if (!popup || !anchor || !frame) return;
    const frameBox = frame.getBoundingClientRect();
    const popupBox = anchor.getBoundingClientRect();
    const edgePadding = 8;
    let shiftX = 0;
    let shiftY = 0;
    if (popupBox.left < frameBox.left + edgePadding) {
      shiftX = frameBox.left + edgePadding - popupBox.left;
    } else if (popupBox.right > frameBox.right - edgePadding) {
      shiftX = frameBox.right - edgePadding - popupBox.right;
    }
    if (popupBox.top < frameBox.top + edgePadding) {
      shiftY = frameBox.top + edgePadding - popupBox.top;
    } else if (popupBox.bottom > frameBox.bottom - edgePadding) {
      shiftY = frameBox.bottom - edgePadding - popupBox.bottom;
    }
    if (shiftX === 0 && shiftY === 0) return;
    setPopupPixel((current) => ({
      x: current.x + shiftX,
      y: current.y + shiftY,
    }));
  }, [popup, popupPixel.x, popupPixel.y]);

  useEffect(() => {
    if (!popup) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (popup.kind === "record") {
        closeRecordPopup();
      } else {
        setPopup(null);
        restorePopupFocus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeRecordPopup, popup, restorePopupFocus]);

  if (providerError) {
    return (
      <div className="map-unavailable" role="alert">
        <p className="card-overline">Basemap unavailable</p>
        <h2>The collection list is still available.</h2>
        <p>{providerError}</p>
        <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
          Retry map
        </button>
      </div>
    );
  }

  const side = "left" as const;
  const clusterAccessibilityControls = (
    <div
      className="map-cluster-accessibility"
      role="group"
      aria-label="Visible map clusters"
    >
      {accessibleClusters.map((cluster) => (
        <button
          key={cluster.id}
          type="button"
          style={{ left: cluster.x, top: cluster.y }}
          aria-label={`Inspect cluster of ${cluster.count} specimens`}
          onClick={(event) => {
            event.stopPropagation();
            rememberPopupOpener(event.currentTarget);
            openCluster(
              cluster.id,
              cluster.count,
              cluster.longitude,
              cluster.latitude,
            );
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      ref={frameRef}
      className="map-canvas-frame"
      data-map-style={styleKey}
      data-map-ready={ready}
      data-uncertainty-count={visibleUncertaintyCount}
      data-cluster-radius={mapClusterRadius}
    >
      <div ref={containerRef} className="map-canvas" />
      {canvasContainer?.isConnected
        ? createPortal(clusterAccessibilityControls, canvasContainer)
        : null}
      {mappedRecords.length === 0 ? (
        <div className="map-empty-overlay" role="status">
          <strong>No matching public coordinates</strong>
          <span>
            Adjust the search or filters; matching unplotted records remain in
            the list.
          </span>
        </div>
      ) : null}
      {popup ? (
        <div
          ref={popupAnchorRef}
          className={`map-popup-anchor is-${side}`}
          style={{ left: popupPixel.x, top: popupPixel.y }}
          onWheel={handlePopupWheel}
          onTouchMove={handlePopupTouchMove}
        >
          {popup.kind === "record" ? (
            <IndividualMapPopup
              record={popup.record}
              onClose={closeRecordPopup}
            />
          ) : (
            <ClusterMapPopup
              records={popup.records}
              onSelect={(specimenId) => {
                onSelectRef.current(specimenId);
                const record = recordsRef.current.find(
                  (candidate) => candidate.specimenId === specimenId,
                );
                if (record && isMappedRecord(record)) {
                  setPopup({
                    kind: "record",
                    record,
                    longitude: record.longitude,
                    latitude: record.latitude,
                  });
                }
              }}
              onClose={() => {
                setPopup(null);
                restorePopupFocus();
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

async function addCollectionLayers(
  map: MapLibreMap,
  points: MapFeatureCollection,
  uncertainty: MapPolygonFeatureCollection,
) {
  map.addSource(uncertaintySourceId, { type: "geojson", data: uncertainty });
  map.addLayer({
    id: "specimen-uncertainty-fill",
    type: "fill",
    source: uncertaintySourceId,
    paint: {
      "fill-color": ["case", ["get", "selected"], "#d8b76f", "#7aa89a"],
      "fill-opacity": ["case", ["get", "selected"], 0.2, 0.11],
    },
  });
  map.addLayer({
    id: "specimen-uncertainty-line",
    type: "line",
    source: uncertaintySourceId,
    paint: {
      "line-color": ["case", ["get", "selected"], "#f2d18b", "#8fbdaf"],
      "line-width": ["case", ["get", "selected"], 2.5, 1.25],
      "line-opacity": 0.85,
      "line-dasharray": [2, 2],
    },
  });
  map.addSource(pointSourceId, {
    type: "geojson",
    data: points,
    cluster: true,
    clusterMaxZoom: 11,
    clusterRadius: mapClusterRadius,
  });
  await addClassMarkerImages(map);
  map.addLayer({
    id: clusterLayerId,
    type: "circle",
    source: pointSourceId,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#d0ad67",
      "circle-radius": ["step", ["get", "point_count"], 18, 5, 23, 12, 29],
      "circle-stroke-color": "#101311",
      "circle-stroke-width": 3,
    },
  });
  map.addLayer({
    id: clusterCountLayerId,
    type: "symbol",
    source: pointSourceId,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 13,
      "text-font": ["Noto Sans Regular"],
    },
    paint: {
      "text-color": "#101311",
      "text-halo-color": "#f4ead6",
      "text-halo-width": 0.5,
    },
  });
  map.addLayer({
    id: approximateLayerId,
    type: "circle",
    source: pointSourceId,
    filter: [
      "all",
      ["!", ["has", "point_count"]],
      ["==", ["get", "coordinatePrecision"], "approximate"],
    ],
    paint: {
      "circle-radius": 14,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": "#f4ead6",
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0.95,
    },
  });
  map.addLayer(
    pointLayer(
      mammalLayerId,
      "mammals",
      "mammal-marker",
      false,
      mammalIconSize,
    ),
  );
  map.addLayer(
    pointLayer(birdLayerId, "birds", "bird-marker", false, birdIconSize),
  );
  map.addLayer(pointLayer(otherLayerId, "__other__", "other-marker", true));
  map.addLayer({
    id: selectedLayerId,
    type: "circle",
    source: pointSourceId,
    filter: ["==", ["get", "specimenId"], ""],
    paint: {
      "circle-radius": 18,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 4,
    },
  });
}

function pointLayer(
  id: string,
  classSlug: string,
  icon: string,
  fallback = false,
  iconSize = mammalIconSize,
): SymbolLayerSpecification {
  const filter = (
    fallback
      ? [
          "all",
          ["!", ["has", "point_count"]],
          ["!in", ["get", "classSlug"], ["literal", ["mammals", "birds"]]],
        ]
      : [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "classSlug"], classSlug],
        ]
  ) as FilterSpecification;
  return {
    id,
    type: "symbol" as const,
    source: pointSourceId,
    filter,
    layout: {
      "icon-image": icon,
      "icon-size": iconSize,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  };
}

async function addClassMarkerImages(map: MapLibreMap) {
  await Promise.all(
    (
      [
        {
          id: "mammal-marker",
          path: "/media/map/mammal-marker.webp",
          fallback: "mammal",
        },
        {
          id: "bird-marker",
          path: "/media/map/bird-marker.webp",
          fallback: "bird",
        },
      ] as const
    ).map(async ({ id, path, fallback }) => {
      if (map.hasImage(id)) return;
      try {
        const response = await map.loadImage(path);
        if (!map.hasImage(id)) {
          map.addImage(id, response.data, { pixelRatio: 4 });
        }
      } catch {
        if (!map.hasImage(id)) {
          map.addImage(id, markerImage(fallback), { pixelRatio: 2 });
        }
      }
    }),
  );
  if (!map.hasImage("other-marker")) {
    map.addImage("other-marker", markerImage("other"), { pixelRatio: 2 });
  }
}

function markerImage(kind: "mammal" | "bird" | "other"): ImageData {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.strokeStyle = "#111411";
  context.lineWidth = 5;
  context.fillStyle =
    kind === "mammal" ? "#c6a45f" : kind === "bird" ? "#77a99b" : "#d8d0c1";
  context.beginPath();
  if (kind === "mammal") {
    context.moveTo(15, 25);
    context.lineTo(18, 11);
    context.lineTo(28, 20);
    context.quadraticCurveTo(32, 17, 36, 20);
    context.lineTo(46, 11);
    context.lineTo(49, 25);
    context.quadraticCurveTo(54, 32, 49, 43);
    context.quadraticCurveTo(42, 54, 32, 54);
    context.quadraticCurveTo(22, 54, 15, 43);
    context.quadraticCurveTo(10, 32, 15, 25);
  } else if (kind === "bird") {
    context.moveTo(10, 31);
    context.lineTo(26, 22);
    context.quadraticCurveTo(42, 13, 52, 28);
    context.quadraticCurveTo(58, 38, 48, 46);
    context.quadraticCurveTo(34, 56, 21, 45);
    context.closePath();
  } else {
    context.rect(15, 15, 34, 34);
  }
  context.closePath();
  context.fill();
  context.stroke();
  return context.getImageData(0, 0, size, size);
}

function transparentImage(): ImageData {
  return new ImageData(new Uint8ClampedArray(4), 1, 1);
}

function attachMapInteractions(
  map: MapLibreMap,
  openCluster: (
    clusterId: number,
    pointCount: number,
    longitude: number,
    latitude: number,
  ) => void,
  onSelectRef: React.MutableRefObject<(specimenId: string) => void>,
) {
  map.on("click", clusterLayerId, (event) => {
    const feature = event.features?.[0];
    const clusterId = Number(feature?.properties?.cluster_id);
    const pointCount = Number(feature?.properties?.point_count);
    if (!Number.isFinite(clusterId) || !Number.isFinite(pointCount)) return;
    openCluster(clusterId, pointCount, event.lngLat.lng, event.lngLat.lat);
  });
  for (const layerId of pointLayerIds) {
    map.on("click", layerId, (event) => {
      const id = String(event.features?.[0]?.properties?.specimenId ?? "");
      if (id) onSelectRef.current(id);
    });
  }
  for (const layerId of [clusterLayerId, ...pointLayerIds]) {
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  }
}

function renderedClusters(map: MapLibreMap): AccessibleCluster[] {
  if (!map.isStyleLoaded() || !map.getLayer(clusterLayerId)) return [];
  const rendered = map.queryRenderedFeatures({ layers: [clusterLayerId] });
  const features = rendered.length
    ? rendered
    : map.querySourceFeatures(pointSourceId);
  const clusters = new Map<number, AccessibleCluster>();
  for (const feature of features) {
    if (feature.geometry.type !== "Point") continue;
    if (feature.properties?.point_count === undefined) continue;
    const id = Number(feature.properties?.cluster_id);
    const count = Number(feature.properties?.point_count);
    const [longitude, latitude] = feature.geometry.coordinates;
    if (
      !Number.isFinite(id) ||
      !Number.isFinite(count) ||
      longitude === undefined ||
      latitude === undefined
    )
      continue;
    const point = map.project([longitude, latitude]);
    const { clientWidth, clientHeight } = map.getContainer();
    if (
      point.x < -40 ||
      point.x > clientWidth + 40 ||
      point.y < -40 ||
      point.y > clientHeight + 40
    )
      continue;
    clusters.set(id, {
      id,
      count,
      longitude,
      latitude,
      x: point.x,
      y: point.y,
    });
  }
  return [...clusters.values()].sort((first, second) => first.id - second.id);
}

function buildPointCollection(records: MapRecord[]): MapFeatureCollection {
  return {
    type: "FeatureCollection",
    features: records.filter(isMappedRecord).map((record) => ({
      type: "Feature",
      id: record.specimenId,
      geometry: {
        type: "Point",
        coordinates: [record.longitude, record.latitude],
      },
      properties: {
        specimenId: record.specimenId,
        taxonId: record.taxonId,
        classSlug: record.classSlug,
        coordinatePrecision: record.coordinatePrecision,
      },
    })),
  };
}

function buildUncertaintyCollection(
  records: MapRecord[],
  selectedSpecimenId: string | null,
  showAll: boolean,
): MapPolygonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: records.flatMap((record) => {
      const selected = record.specimenId === selectedSpecimenId;
      if (!showAll && !selected) return [];
      const polygon = createUncertaintyPolygon(record, selected);
      return polygon ? [polygon] : [];
    }),
  };
}

function emptyPolygons(): MapPolygonFeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function isClusterListTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(".map-cluster-popup > ul"))
  );
}

function isPopupInteractionTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element && Boolean(target.closest(".map-popup-card"))
  );
}

function fitRecords(
  map: MapLibreMap,
  records: MapRecord[],
  immediate: boolean,
) {
  const mapped = records.filter(isMappedRecord);
  if (mapped.length === 0) {
    map.easeTo({
      center: defaultMapCenter,
      zoom: defaultMapZoom,
      duration: immediate ? 0 : 350,
    });
    return;
  }
  if (mapped.length === 1) {
    map.easeTo({
      center: [mapped[0]!.longitude, mapped[0]!.latitude],
      zoom: 10.5,
      duration: immediate ? 0 : 350,
      padding: popupCameraPadding(map.getContainer()),
    });
    return;
  }
  const bounds = new maplibregl.LngLatBounds();
  for (const record of mapped)
    bounds.extend([record.longitude, record.latitude] as LngLatLike);
  map.fitBounds(bounds, {
    padding: popupCameraPadding(map.getContainer()),
    maxZoom: 10.5,
    duration: immediate ? 0 : 450,
  });
}

function popupCameraPadding(container: HTMLElement | null) {
  const narrow = (container?.clientWidth ?? 0) < 700;
  return narrow
    ? { top: 64, right: 42, bottom: 170, left: 42 }
    : { top: 72, right: 84, bottom: 72, left: 84 };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
