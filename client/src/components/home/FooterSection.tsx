import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-sm text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CareerCraft AI</p>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>

          <Link to="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>

          <Link to="/contact" className="transition-colors hover:text-white">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default FooterSection;
