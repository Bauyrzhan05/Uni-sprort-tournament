import { forwardRef } from "react";
import Loader from "./Loader";

/**
 * Reusable Button component.
 * Variants: primary | accent | ghost | danger
 */
const variantMap = {
  primary: "btn-primary",
  accent:  "btn-accent",
  ghost:   "btn-ghost",
  danger:  "bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 inline-flex items-center gap-2",
};

const sizeMap = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-7 !py-3 !text-base",
};

const Button = forwardRef(function Button(
  { children, variant = "primary", size = "md", loading = false, icon, className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${variantMap[variant]} ${sizeMap[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader size="sm" inline /> : icon}
      {children}
    </button>
  );
});

export default Button;
