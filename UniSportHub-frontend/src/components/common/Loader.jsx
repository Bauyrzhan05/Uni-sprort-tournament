/**
 * Loader / spinner component.
 * - size: "sm" | "md" | "lg"
 * - inline: render as inline element (for button loading state)
 * - fullPage: center in the full viewport
 */
const sizeMap = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-[3px]" };

function Loader({ size = "md", inline = false, fullPage = false, text }) {
  const spinner = (
    <span
      className={`${sizeMap[size]} rounded-full border-surface-border border-t-brand-500 animate-spin inline-block`}
      role="status"
      aria-label="Loading"
    />
  );

  if (inline) return spinner;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-DEFAULT/80 backdrop-blur-sm z-50 gap-4">
        {spinner}
        {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {spinner}
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
}

export default Loader;
