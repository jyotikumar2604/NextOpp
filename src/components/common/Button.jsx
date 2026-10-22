import { Link } from "react-router-dom";
import { cx } from "../../utils/profile";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
  secondary: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  soft: "bg-blue-50 text-blue-700 hover:bg-blue-100",
};

const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-[15px]", icon: "size-9" };

/** Class string so <Link> and <a> can look like buttons without wrapping. */
export const buttonClasses = (variant = "primary", size = "md", extra) => cx(base, variants[variant], sizes[size], extra);

export function Button({ variant, size, className, type = "button", ...props }) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function LinkButton({ variant, size, className, ...props }) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
