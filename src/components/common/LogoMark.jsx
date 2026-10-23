/** NextOpp mark: an "N" whose diagonal ends in a dot, a path pointing to the next step. */
export default function LogoMark({ className = "size-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="NextOpp">
      <rect width="32" height="32" rx="8" fill="#2d47f0" />
      <path d="M9 23V10.5l14 11V9" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="9" r="2.2" fill="#fff" />
    </svg>
  );
}
