import type { Measurement, PartialDate } from "./types";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatMeasurement(measurement: Measurement): string {
  if (measurement.status === "not_recorded") return "Not recorded";
  if (measurement.status === "not_applicable") return "Not applicable";
  const prefix = measurement.status === "approximate" ? "Approx. " : "";
  return `${prefix}${new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(measurement.value ?? 0)} ${measurement.unit}`;
}

export function formatPartialDate(date: PartialDate): string {
  if (date.value === null) return "Not recorded";
  const [year = 0, month = 1, day = 1] = date.value.split("-").map(Number);
  if (date.precision === "year") return String(year);
  if (date.precision === "month") return `${months[month - 1]} ${year}`;
  return `${day} ${months[month - 1]} ${year}`;
}

export function humanizeToken(value: string): string {
  const words = value.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatCoordinate(
  value: number,
  axis: "latitude" | "longitude",
) {
  const suffix =
    axis === "latitude" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
}
