import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import NotificationMenu from "./NotificationMenu";
import { useApp } from "../../context/AppContext";
import { initials } from "../../utils/profile";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** The search box is a trigger for the command palette, so there is one consistent global search. */
export default function Navbar({ onMenu, onSearch }) {
  const { profile } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-stone-200/80 bg-canvas/85 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/60 lg:hidden"><Menu className="size-5" /></button>

      <button
        type="button"
        onClick={onSearch}
        aria-haspopup="dialog"
        aria-label="Search opportunities and pages"
        className="group flex h-10 max-w-2xl flex-1 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3.5 text-left text-sm text-stone-400 shadow-sm transition-colors hover:border-stone-300"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">Search internships, scholarships, hackathons...</span>
        <kbd className="hidden rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] font-medium text-stone-500 sm:block">{isMac ? "⌘" : "Ctrl"} K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationMenu />
        {profile && (
          <Link to="/profile" aria-label="Your profile" className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white hover:bg-ink-700">{initials(profile.name)}</Link>
        )}
      </div>
    </header>
  );
}
