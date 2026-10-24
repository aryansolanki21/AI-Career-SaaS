import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  Menu,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";
import { useAppData } from "../context/useAppData";

const navigation = [
  { label: "Resume Analysis", to: "/analyse", icon: FileSearch },
  { label: "Job Matching", to: "/jobmatcher", icon: BriefcaseBusiness },
  { label: "Resume Builder", to: "/resumebuilder", icon: FileText },
  { label: "Interview Prep", to: "/interviewprep", icon: MessageSquareText },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, user, LogoutUser } = useAppData();

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navigationLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  const accountInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";
  const firstName = user?.name?.trim().split(/\s+/)[0] || "My Account";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          onClick={closeMenu}
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
          aria-label="CareerCraft AI home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 sm:h-10 sm:w-10">
            <Sparkles size={21} strokeWidth={2.2} />
          </span>

          <span className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 sm:text-xl">
            CareerCraft <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {isAuth && (
          <div className="hidden items-center gap-0.5 xl:flex">
            {navigation.map(({ label, to }) => (
              <NavLink key={to} to={to} className={navigationLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {isAuth ? (
            <>
              <Link
                to="/account"
                className="flex max-w-40 items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {accountInitial}
                </span>

                <span className="truncate text-sm font-semibold text-slate-700">
                  {firstName}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  LogoutUser();
                }}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
              >
                Get started
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        <div className="hidden">
          {isAuth ? (
            <>
              <Link
                to="/account"
                aria-label="My account"
                title={user?.name || "My Account"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {accountInitial}
              </Link>

              <button
                type="button"
                onClick={LogoutUser}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
              >
                Get started
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 xl:hidden"
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-4 py-5 shadow-lg sm:px-6 xl:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {isAuth &&
              navigation.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

            {isAuth ? (
              <>
                <Link
                  to="/account"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    {accountInitial}
                  </span>
                  <span className="truncate">{user?.name || "My Account"}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    LogoutUser();
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                >
                  Get started
                  <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
