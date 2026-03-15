import Button from "./Button";

/** Displayed when a list or table has no items */
function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <div className="text-slate-600 mb-2">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action} className="mt-2">{actionLabel || "Add New"}</Button>
      )}
    </div>
  );
}

export default EmptyState;
