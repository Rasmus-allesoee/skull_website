export function MeasurementDiagram() {
  return (
    <figure className="measurement-diagram">
      <svg
        viewBox="0 0 640 320"
        role="img"
        aria-labelledby="measurement-diagram-title measurement-diagram-description"
      >
        <title id="measurement-diagram-title">Skull measurement guide</title>
        <desc id="measurement-diagram-description">
          Simplified lateral skull outline with numbered guides for maximum
          skull length, skull height, maximum skull width, mandible length, and
          exposed canine length. The adjacent text list gives the values.
        </desc>
        <path
          className="diagram-bone"
          d="M91 193c18-61 69-112 148-128 88-18 178 4 235 47l84 33 26 30-28 25-110 4-52 49-84 9-98-20-82-4-39-45Z"
        />
        <path
          className="diagram-bone"
          d="M144 224c93 20 210 26 325 1l73-2-31 33-86 18-216-3-74-29 9-18Z"
        />
        <path className="diagram-detail" d="M208 106c30-23 82-29 117-8" />
        <path className="diagram-detail" d="M392 147c18-14 43-17 66-6" />
        <path className="diagram-tooth" d="m441 194 12 34 14-33" />
        <g className="diagram-guide">
          <path d="M82 287h478M82 278v18M560 278v18" />
          <text x="321" y="310">
            1 · length
          </text>
          <path d="M114 68v151M105 68h18M105 219h18" />
          <text x="100" y="147" transform="rotate(-90 100 147)">
            2 · height
          </text>
          <path d="M175 250h351M175 242v17M526 242v17" />
          <text x="350" y="246">
            4 · mandible
          </text>
          <path d="M443 180v54M435 180h17M435 234h17" />
          <text x="462" y="215">
            5
          </text>
        </g>
      </svg>
      <figcaption>
        Orientation guide only—not to scale. Maximum width is taken across the
        widest transverse points and is listed as marker 3 in the text key.
      </figcaption>
    </figure>
  );
}
