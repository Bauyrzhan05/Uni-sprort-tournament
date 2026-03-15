import { forwardRef } from "react";

/**
 * Reusable Input / Select / Textarea component.
 * Pass `as="select"` or `as="textarea"` to render different elements.
 */
const Input = forwardRef(function Input(
  { label, error, hint, as: Tag = "input", className = "", required, children, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <Tag
        ref={ref}
        className={`input-field ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Input;
