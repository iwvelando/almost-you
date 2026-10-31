export function Icon({
  kind,
}: {
  kind: "spark" | "arrow" | "sun" | "moon" | "system" | "circle";
}) {
  const paths = {
    spark: "M12 2v20M2 12h20M5 5l14 14M5 19L19 5",
    arrow: "M6 18 18 6M6 6h12v12",
    sun: "M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2",
    moon: "M20 15.3A8.5 8.5 0 0 1 8.7 4a8.5 8.5 0 1 0 11.3 11.3",
    system: "M8 21h8m-4-4v4",
    circle: "",
  };
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[kind]} />
      {kind === "sun" && <circle cx="12" cy="12" r="4" />}
      {kind === "system" && <rect x="3" y="4" width="18" height="13" rx="2" />}
      {kind === "circle" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="6" />
        </>
      )}
    </svg>
  );
}
