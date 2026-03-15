/** Displays a status or label badge */
function Badge({ children, className = "" }) {
  return (
    <span className={`badge ${className}`}>{children}</span>
  );
}

export default Badge;
