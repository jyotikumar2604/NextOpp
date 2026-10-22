import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import NotificationMenu from "./NotificationMenu";
import { useApp } from "../../context/AppContext";
import { initials } from "../../utils/profile";

export default function Navbar({ onMenu }) {
  const { profile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  // Keep the box in sync with the Explore page's ?q= when navigating there.
  useEffect(() => {
    setQ(location.pathname === "/explore" ? (new URLSearchParams(location.search).get("q") ?? "") : "");
  }, [location.pathname, location.search]);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/explore?q=${encodeURIComponent(term)}` : "/explore");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
        <Menu className="size-5" />
      </button>

      <form onSubmit={submit} role="search" className="relative max-w-2xl flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search internships, scholarships, hackathons..."
          aria-label="Search opportunities"
          className="input h-10 border-transparent bg-slate-100 pl-10 shadow-none hover:border-slate-300 focus:bg-white"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationMenu />
        {profile && (
          <Link to="/profile" aria-label="Your profile" className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700">
            {initials(profile.name)}
          </Link>
        )}
      </div>
    </header>
  );
}
