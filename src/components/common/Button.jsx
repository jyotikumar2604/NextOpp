import { Link } from "react-router-dom";
import { cx } from "../../utils/profile";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  secondary: "border border-stone-300 bg-white text-stone-700 shadow-sm hover:bg-stone-50",
  ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
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
