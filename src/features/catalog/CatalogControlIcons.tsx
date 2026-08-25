export function FilterControlIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 5h16l-6.25 7.1v5.15L10.25 19v-6.9L4 5Z" />
    </svg>
  );
}

export function TaxonomyControlIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 12h4M11 5v14M11 5h6M11 12h6M11 19h6" />
    </svg>
  );
}

export function SortDirectionControlIcon({
  direction,
}: {
  direction: "ascending" | "descending";
}) {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {direction === "ascending" ? (
        <>
          <path d="M7 19V5M7 5 4 8M7 5l3 3" />
          <path d="M14 7h6M14 12h4M14 17h2" />
        </>
      ) : (
        <>
          <path d="M7 5v14M7 19l-3-3M7 19l3-3" />
          <path d="M14 7h2M14 12h4M14 17h6" />
        </>
      )}
    </svg>
  );
}

export function ResetControlIcon() {
  return (
    <svg
      className="catalog-control-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 9V4m0 5h5M5.7 8a8 8 0 1 1-1.1 7.8" />
    </svg>
  );
}
