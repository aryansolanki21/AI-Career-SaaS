import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileSearch,
  FileText,
  Menu,
  MessageSquareText,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAppData } from "../context/useAppData";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const NAVIGATION: NavItem[] = [
  { label: "Resume Analysis", to: "/analyse", icon: FileSearch },
  { label: "Job Matching", to: "/jobmatcher", icon: BriefcaseBusiness },
  { label: "Resume Builder", to: "/resumebuilder", icon: FileText },
  { label: "Interview Prep", to: "/interviewprep", icon: MessageSquareText },
];

/* Shared class strings keep styling consistent and easy to change in one place. */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

const GHOST_BUTTON = `rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 ${FOCUS_RING}`;

const PRIMARY_BUTTON = `inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 ${FOCUS_RING}`;

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${FOCUS_RING} ${
    isActive
      ? "bg-slate-100 text-slate-950"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${FOCUS_RING} ${
    isActive
      ? "bg-slate-100 text-slate-950"
      : "text-slate-700 hover:bg-slate-50"
  }`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, user } = useAppData();

  const closeMenu = () => setIsMenuOpen(false);

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const accountInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6"
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="CareerCraft AI home"
          className={`flex shrink-0 items-center gap-2.5 rounded-md ${FOCUS_RING}`}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold tracking-tight text-white shadow-sm"
          >
            C
          </span>

          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-slate-950">
            CareerCraft <span className="font-medium text-slate-500">AI</span>
          </span>
        </Link>

        {/* Desktop tool links (signed-in users only) */}
        {isAuth && (
          <ul className="hidden items-center gap-1 lg:flex">
            {NAVIGATION.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={desktopLinkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop account area */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {isAuth ? (
            <Link
              to="/account"
              aria-label={`Account: ${user?.name || "Account"}`}
              className={`flex max-w-48 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 ${FOCUS_RING}`}
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800"
              >
                {accountInitial}
              </span>

              <span className="max-w-32 truncate text-sm font-semibold text-slate-800">
                {firstName}
              </span>
            </Link>
          ) : (
            <>
              <Link to="/login" className={GHOST_BUTTON}>
                Log in
              </Link>

              <Link to="/register" className={PRIMARY_BUTTON}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden ${FOCUS_RING}`}
        >
          {isMenuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {isAuth && (
              <ul className="flex flex-col gap-1">
                {NAVIGATION.map(({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={closeMenu}
                      className={mobileLinkClass}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}

            <div
              className={`flex flex-col gap-2 ${
                isAuth ? "mt-3 border-t border-slate-200 pt-4" : ""
              }`}
            >
              {isAuth ? (
                <Link
                  to="/account"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50 ${FOCUS_RING}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800"
                  >
                    {accountInitial}
                  </span>

                  <span className="truncate">{user?.name || "Account"}</span>

                  <span className="ml-auto text-sm font-medium text-slate-500">
                    Account
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className={`rounded-lg border border-slate-300 px-4 py-3 text-center text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 ${FOCUS_RING}`}
                  >
                    Log in
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className={`${PRIMARY_BUTTON} py-3 text-base`}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
