import { useState } from "react";
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

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuth, user } = useAppData();

  const navigation = [
    {
      label: "Resume Analysis",
      to: "/analyse",
      icon: FileSearch,
    },
    {
      label: "Job Matching",
      to: "/jobmatcher",
      icon: BriefcaseBusiness,
    },
    {
      label: "Resume Builder",
      to: "/resumebuilder",
      icon: FileText,
    },
    {
      label: "Interview Prep",
      to: "/interviewprep",
      icon: MessageSquareText,
    },
  ];

  const closeMenu = () => setOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-19 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3"
          aria-label="CareerCraft AI home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Sparkles size={21} strokeWidth={2.2} />
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            CareerCraft <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Desktop feature navigation: authenticated users only */}
        {isAuth && (
          <div className="hidden items-center gap-1 xl:flex">
            {navigation.map(({ label, to }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Desktop account actions */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span className="max-w-32 truncate text-sm font-semibold text-slate-700">
                {user?.name?.split(" ")[0] || "My Account"}
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                Sign in
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
              >
                Get started
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Compact navigation for mobile and tablet */}
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 xl:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* Mobile and tablet menu */}
      {open && (
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
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
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

            {isAuth && (
              <>
                <div className="my-2 border-t border-slate-200" />

                <Link
                  to="/account"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span className="truncate">{user?.name || "My Account"}</span>
                </Link>
              </>
            )}

            {!isAuth && (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign in
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
