import {
  defaultCatalogState,
  normalizeCatalogState,
  parseCatalogState,
  serializeCatalogState,
  type CatalogState,
} from "@/features/catalog/catalogState";

import { defaultMapStyle, isMapStyleKey, type MapStyleKey } from "./provider";

export interface MapState extends CatalogState {
  selectedSpecimenId: string | null;
  style: MapStyleKey;
  showUncertainty: boolean;
}

export const defaultMapState: MapState = {
  ...defaultCatalogState,
  mode: "specimens",
  sort: "common-name",
  selectedSpecimenId: null,
  style: defaultMapStyle,
  showUncertainty: false,
};

export function parseMapState(search: string): MapState {
  const parameters = new URLSearchParams(search);
  const catalog = parseCatalogState(search);
  const specimen = parameters.get("specimen");
  const style = parameters.get("style");
  return normalizeMapState({
    ...catalog,
    mode: "specimens",
    sort: "common-name",
    direction: "ascending",
    selectedSpecimenId:
      specimen && /^SPEC-\d{4,}$/.test(specimen) ? specimen : null,
    style: isMapStyleKey(style) ? style : defaultMapStyle,
    showUncertainty: parameters.get("uncertainty") === "1",
  });
}

export function normalizeMapState(state: MapState): MapState {
  const catalog = normalizeCatalogState({
    ...state,
    mode: "specimens",
    sort: "common-name",
    direction: "ascending",
  });
  return {
    ...catalog,
    selectedSpecimenId:
      state.selectedSpecimenId && /^SPEC-\d{4,}$/.test(state.selectedSpecimenId)
        ? state.selectedSpecimenId
        : null,
    style: isMapStyleKey(state.style) ? state.style : defaultMapStyle,
    showUncertainty: Boolean(state.showUncertainty),
  };
}

export function serializeMapState(state: MapState): string {
  const normalized = normalizeMapState(state);
  const parameters = new URLSearchParams(
    serializeCatalogState({
      ...normalized,
      mode: "species",
      sort: "browse",
      direction: "ascending",
    }),
  );
  if (normalized.selectedSpecimenId) {
    parameters.set("specimen", normalized.selectedSpecimenId);
  }
  if (normalized.style !== defaultMapStyle) {
    parameters.set("style", normalized.style);
  }
  if (normalized.showUncertainty) parameters.set("uncertainty", "1");
  return parameters.toString();
}

export function clearMapCollectionState(state: MapState): MapState {
  return {
    ...defaultMapState,
    style: state.style,
    showUncertainty: state.showUncertainty,
  };
}
