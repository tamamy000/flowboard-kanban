export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="bg-primary flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.625}
        height={size * 0.625}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="3" width="4" height="14" rx="1.5" fill="white" />
        <rect x="8" y="3" width="4" height="9" rx="1.5" fill="white" />
        <rect x="14" y="3" width="4" height="11" rx="1.5" fill="white" />
      </svg>
    </div>
  );
}
