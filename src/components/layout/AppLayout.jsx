import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandPalette from "./CommandPalette";
import ApplyConfirmDialog from "../opportunities/ApplyConfirmDialog";
import DataGate from "../common/DataGate";
import { cx } from "../../utils/profile";

const COLLAPSE_KEY = "nextopp:ui:sidebar-collapsed"; // a UI preference only, nothing sensitive

/** Application shell: collapsible ink sidebar (desktop), drawer (mobile), sticky top bar, command palette. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  const { pathname } = useLocation();

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1"); } catch { /* storage unavailable */ }
      return !c;
    });

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Ctrl/Cmd + K opens search; Escape closes the mobile drawer.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-[70] rounded-md bg-white px-3 py-2 text-sm font-medium text-brand-700 shadow focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>

      <aside className={cx("fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block", collapsed ? "w-[76px]" : "w-64")}>
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className={cx("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <Navbar onMenu={() => setMenuOpen(true)} onSearch={() => setPaletteOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:py-8">
          <DataGate>
            <Outlet />
          </DataGate>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ApplyConfirmDialog />
    </div>
  );
}
