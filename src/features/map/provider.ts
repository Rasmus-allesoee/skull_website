export const openFreeMapOrigin = "https://tiles.openfreemap.org" as const;

export const mapStyles = [
  {
    key: "fiord",
    label: "Museum dark",
    description: "Muted dark museum map",
    styleUrl: `${openFreeMapOrigin}/styles/fiord`,
  },
  {
    key: "dark",
    label: "Dark",
    description: "High-contrast dark map",
    styleUrl: `${openFreeMapOrigin}/styles/dark`,
  },
  {
    key: "positron",
    label: "Light",
    description: "Restrained light map",
    styleUrl: `${openFreeMapOrigin}/styles/positron`,
  },
  {
    key: "liberty",
    label: "Standard",
    description: "General-purpose color map",
    styleUrl: `${openFreeMapOrigin}/styles/liberty`,
  },
  {
    key: "bright",
    label: "Bright",
    description: "Vivid high-detail map",
    styleUrl: `${openFreeMapOrigin}/styles/bright`,
  },
] as const;

export type MapStyleKey = (typeof mapStyles)[number]["key"];

export const defaultMapStyle: MapStyleKey = "fiord";

export function isMapStyleKey(value: string | null): value is MapStyleKey {
  return mapStyles.some((style) => style.key === value);
}

export function getMapStyle(key: MapStyleKey) {
  return mapStyles.find((style) => style.key === key) ?? mapStyles[0];
}

export const mapAttribution =
  '<a href="https://openfreemap.org/" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
