export function LayersIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m3 8 9-5 9 5-9 5-9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}

export function UncertaintyIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" strokeDasharray="2.5 2.5" />
    </svg>
  );
}

export function ResultsIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r=".8" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r=".8" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ResetViewIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 8V3m0 0h5M4 3l4 4" />
      <path d="M5.5 12a7 7 0 1 0 2-5" />
    </svg>
  );
}
