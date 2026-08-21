import {
  measurementDefinitions,
  measurementProfileLayouts,
  type MeasurementProfile,
} from "@/domain/content/types";

import { GuideDialog } from "./GuideDialog";

const ageClasses = [
  {
    label: "Juvenile",
    description:
      "Deciduous teeth present and/or permanent teeth unerupted or erupting. Cranial sutures are wide and clearly open; in very young animals, some skull elements may remain poorly fused or separate. Bone is relatively thin and delicate, and muscle-attachment ridges and crests are weakly developed.",
  },
  {
    label: "Subadult",
    description:
      "Permanent teeth are replacing the deciduous dentition or have recently erupted and show essentially no wear. The skull is near adult size, but some sutures and synchondroses remain conspicuous. Muscle attachments become stronger and crests, such as sagittal or nuchal crests where present in the species, begin to develop.",
  },
  {
    label: "Young adult",
    description:
      "Complete permanent dentition with sharp cusps and little or no wear. The skull has essentially reached adult proportions and most developmental fusion is complete. Muscle-attachment areas and cranial crests are well defined but may continue to become more robust.",
  },
  {
    label: "Adult",
    description:
      "Complete permanent dentition with clear but moderate wear; cusps are becoming rounded or flattened. The skull is fully developed and robust, with strong muscle-attachment scars, ridges, and crests. Cranial sutures may become less distinct or partially fused.",
  },
  {
    label: "Old adult",
    description:
      "Heavy dental wear with strongly flattened or lost cusps, exposed dentine, and sometimes broken or ante-mortem missing teeth. Long-standing tooth loss may leave partially or completely resorbed or healed alveoli. Sutures may be extensively fused or difficult to distinguish, although complete fusion is not universal.",
  },
  {
    label: "Indeterminate",
    description:
      "Dental development, wear, or cranial maturation cannot support a confident classification, or different indicators give conflicting results.",
  },
] as const;

const conditionClasses = [
  {
    scale: 1,
    label: "Excellent",
    description:
      "The skull is essentially complete and intact. All or nearly all teeth are present, with no significant fractures, cracks, missing processes, or surface damage. Delicate structures such as zygomatic arches, nasal bones, and auditory bullae are intact.",
  },
  {
    scale: 2,
    label: "Good",
    description:
      "The skull is mostly complete and well preserved. It may have a few missing teeth, small chips, minor cracks, or slight damage to delicate structures, but the overall skull morphology is intact and unaffected.",
  },
  {
    scale: 3,
    label: "Fair",
    description:
      "Noticeable damage or incompleteness is present. Several teeth may be missing, and one or more processes, arches, nasal elements, or other structures may be broken or absent. Cracks or moderate surface deterioration may be present, but most of the skull remains intact.",
  },
  {
    scale: 4,
    label: "Poor",
    description:
      "There is substantial damage or loss of bone. Major structures may be broken or missing, with extensive cracking, fragmentation, weathering, erosion, or numerous missing teeth. Important anatomical features may no longer be fully represented.",
  },
  {
    scale: 5,
    label: "Fragmentary",
    description:
      "Only part of the skull remains, or the specimen consists of multiple incomplete fragments. Large portions of the cranium or facial skeleton are absent, and the original skull morphology cannot be reconstructed reliably.",
  },
] as const;

export function AgeGuide() {
  return (
    <GuideDialog title="Age-class guide" triggerLabel="How age is estimated">
      <GuideTable
        columns={["Age group", "Typical skull and tooth characteristics"]}
        rows={ageClasses.map((item) => [item.label, item.description])}
      />
      <p className="guide-note">
        Age classes are estimates based primarily on tooth development and wear,
        supported by cranial fusion and morphology. The timing and expression of
        these characteristics vary between species and individuals.
      </p>
    </GuideDialog>
  );
}

export function ConditionGuide() {
  return (
    <GuideDialog
      title="Specimen-condition guide"
      triggerLabel="View condition scale"
    >
      <GuideTable
        columns={["Condition", "Typical characteristics"]}
        rows={conditionClasses.map((item) => [
          `${item.scale} · ${item.label}`,
          item.description,
        ])}
      />
      <p className="guide-note">
        Condition describes the physical preservation and completeness of the
        specimen. Natural abnormalities, age-related tooth loss, and
        developmental features are not considered damage.
      </p>
    </GuideDialog>
  );
}

export function MeasurementGuide({ profile }: { profile: MeasurementProfile }) {
  const layout = measurementProfileLayouts[profile];
  const measurementKeys = [...layout.primary, ...layout.additional];
  return (
    <GuideDialog
      title="Measurement guide"
      triggerLabel="Open measurement guide"
    >
      <p>
        This quick guide defines the fields used in the collection. A dedicated
        illustrated methodology page will add exact landmark photographs before
        these measurements are presented as a reproducible measurement protocol.
      </p>
      <GuideTable
        columns={["Measurement", "Current definition"]}
        rows={measurementKeys.map((key) => [
          `${measurementDefinitions[key].label} (${measurementDefinitions[key].unit})`,
          measurementDefinitions[key].description,
        ])}
      />
    </GuideDialog>
  );
}

function GuideTable({
  columns,
  rows,
}: {
  columns: readonly [string, string];
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <div className="guide-table-wrap">
      <table className="guide-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, description]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
