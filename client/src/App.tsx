import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppData } from "./context/useAppData";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Analyse from "./pages/Analyse";
import JobMatcher from "./pages/JobMatcher";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeBuilder from "./pages/ResumeBuilder";

const AppContent = () => {
  const { loading } = useAppData();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-blue-600" />
          <p className="text-sm tracking-widest text-slate-500">LOADING...</p>
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/analyse" element={<Analyse />} />
        <Route path="/jobmatcher" element={<JobMatcher />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />

        <Route
          path="*"
          element={
            <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  404 — Page not found
                </h1>

                <p className="mt-3 text-slate-600">
                  The page you are looking for does not exist yet.
                </p>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => <AppContent />;

export default App;
