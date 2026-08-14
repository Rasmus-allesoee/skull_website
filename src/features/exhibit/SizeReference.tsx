import type { Measurement } from "@/domain/content/types";

export function SizeReference({ skullLength }: { skullLength: Measurement }) {
  if (
    skullLength.value === null ||
    (skullLength.status !== "measured" && skullLength.status !== "approximate")
  ) {
    return (
      <aside className="size-reference" aria-labelledby="size-reference-title">
        <h3 id="size-reference-title">Size reference</h3>
        <p>A proportional length reference is unavailable.</p>
      </aside>
    );
  }

  const lengthMm = skullLength.value;
  const scaleMaximum = Math.max(150, Math.ceil(lengthMm / 50) * 50);
  const specimenWidth = `${(lengthMm / scaleMaximum) * 100}%`;
  const referenceWidth = `${(100 / scaleMaximum) * 100}%`;
  const lengthCm = new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
  }).format(lengthMm / 10);

  return (
    <figure className="size-reference" aria-labelledby="size-reference-title">
      <div>
        <p className="data-label">Relative length</p>
        <h3 id="size-reference-title">A visual sense of scale</h3>
        <p>
          The recorded maximum skull length is {lengthCm} cm—shown against a 10
          cm reference.
        </p>
      </div>
      <div className="size-bars" aria-hidden="true">
        <div>
          <span>Specimen</span>
          <i className="specimen-size-bar" style={{ width: specimenWidth }} />
          <b>{lengthMm} mm</b>
        </div>
        <div>
          <span>10 cm</span>
          <i className="reference-size-bar" style={{ width: referenceWidth }} />
          <b>100 mm</b>
        </div>
      </div>
      <figcaption>
        The bars are proportional to each other, not physical size on screen.
      </figcaption>
    </figure>
  );
}
