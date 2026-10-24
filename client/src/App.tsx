import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppData } from "./context/useAppData";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";

const AppContent = () => {
  const { loading } = useAppData();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b14] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-linear-to-br from-indigo-500 to-emerald-400" />

          <p className="text-sm tracking-widest text-white/50">LOADING...</p>
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <main className="mx-auto min-h-[calc(100vh-64px)] max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                Build your next career move.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Analyse your resume, discover relevant jobs, and prepare for
                interviews with AI.
              </p>
            </main>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
