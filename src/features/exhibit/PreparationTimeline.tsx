import { formatMeasurement, humanizeToken } from "@/domain/content/display";
import type { SpecimenRecord } from "@/domain/content/types";

export function PreparationTimeline({
  specimen,
}: {
  specimen: SpecimenRecord;
}) {
  const steps = [
    {
      label: "Defleshing",
      methods: specimen.preparation.defleshing.method,
      duration: specimen.preparation.defleshing.duration,
    },
    {
      label: "Degreasing",
      methods: specimen.preparation.degreasing.method,
      duration: specimen.preparation.degreasing.duration,
    },
    {
      label: "Whitening",
      methods: specimen.preparation.whitening.method,
      duration: specimen.preparation.whitening.duration,
    },
  ];

  return (
    <section className="record-panel" aria-labelledby="preparation-title">
      <p className="section-kicker">Preparation record</p>
      <h2 id="preparation-title">From specimen to exhibit</h2>
      <ol className="preparation-timeline">
        {steps.map((step, index) => (
          <li key={step.label}>
            <span className="timeline-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{step.label}</h3>
              <p>
                {step.methods.length > 0
                  ? step.methods.map(humanizeToken).join(" + ")
                  : "Not recorded"}
              </p>
              <small>Duration · {formatMeasurement(step.duration)}</small>
            </div>
          </li>
        ))}
      </ol>
      <dl className="data-list compact-data-list">
        <div>
          <dt>Peroxide concentration</dt>
          <dd>
            {formatMeasurement(
              specimen.preparation.whitening.hydrogenPeroxidePercent,
            )}
          </dd>
        </div>
      </dl>
      {specimen.preparation.notes ? (
        <p className="record-note">{specimen.preparation.notes}</p>
      ) : null}
    </section>
  );
}
